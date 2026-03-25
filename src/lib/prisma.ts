/** Supabase-backed Prisma compatibility adapter used by the copied Takdi app layer. */
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ModelName =
  | "workspace"
  | "project"
  | "asset"
  | "generationJob"
  | "exportArtifact"
  | "usageLedger"
  | "composeTemplate";

type QueryArgs = {
  where?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc">;
  take?: number;
  select?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

type AggregateArgs = QueryArgs & {
  _sum?: Record<string, boolean>;
};

type AnyRecord = Record<string, unknown>;

const TABLES: Record<ModelName, string> = {
  workspace: "workspaces",
  project: "projects",
  asset: "assets",
  generationJob: "generation_jobs",
  exportArtifact: "export_artifacts",
  usageLedger: "usage_ledger",
  composeTemplate: "compose_templates",
};

const UPDATED_AT_MODELS = new Set<ModelName>([
  "workspace",
  "project",
  "composeTemplate",
  "asset",
  "generationJob",
  "exportArtifact",
  "usageLedger",
]);
const workspaceSeedCache = new Set<string>();

function createDeferred<T>(executor: () => Promise<T>): Promise<T> {
  let promise: Promise<T> | null = null;
  const run = () => {
    promise ??= executor();
    return promise;
  };

  return {
    then(onfulfilled, onrejected) {
      return run().then(onfulfilled, onrejected);
    },
    catch(onrejected) {
      return run().catch(onrejected);
    },
    finally(onfinally) {
      return run().finally(onfinally);
    },
    [Symbol.toStringTag]: "Promise",
  } as Promise<T>;
}

function camelToSnake(value: string) {
  return value.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
}

function snakeToCamel(value: string) {
  return value.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

function normalizeValue(key: string, value: unknown): unknown {
  if (value == null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeValue(key, entry));
  }

  if (typeof value === "object") {
    return normalizeRecord(value as Record<string, unknown>);
  }

  if (
    typeof value === "string" &&
    key.endsWith("At") &&
    /^\d{4}-\d{2}-\d{2}T/.test(value)
  ) {
    return new Date(value);
  }

  return value;
}

function normalizeRecord(row: Record<string, unknown>) {
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    const nextKey = snakeToCamel(key);
    normalized[nextKey] = normalizeValue(nextKey, value);
  }

  return normalized;
}

function serializeValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => serializeValue(entry));
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (entry !== undefined) {
        result[key] = serializeValue(entry);
      }
    }
    return result;
  }

  return value;
}

function prepareData(data: Record<string, unknown>, model: ModelName) {
  const payload: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      payload[camelToSnake(key)] = serializeValue(value);
    }
  }

  if (UPDATED_AT_MODELS.has(model)) {
    payload.updated_at = new Date().toISOString();
  }

  return payload;
}

async function ensureWorkspaceExists(workspaceId: string) {
  if (!workspaceId || workspaceSeedCache.has(workspaceId)) {
    return;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.workspace)
    .select("id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    const { error: insertError } = await supabase.from(TABLES.workspace).insert({
      id: workspaceId,
      name: process.env.DEFAULT_WORKSPACE_NAME ?? "Takdi Studio",
    });

    if (insertError && !String(insertError.message).includes("duplicate key")) {
      throw insertError;
    }
  }

  workspaceSeedCache.add(workspaceId);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase query builder type is dynamic
function applyDirectFilters(query: any, where?: Record<string, unknown>) {
  if (!where) {
    return query;
  }

  let next = query;

  for (const [key, rawValue] of Object.entries(where)) {
    if (
      rawValue &&
      typeof rawValue === "object" &&
      !Array.isArray(rawValue) &&
      !("in" in rawValue) &&
      !("gte" in rawValue) &&
      !("startsWith" in rawValue)
    ) {
      continue;
    }

    const column = camelToSnake(key);
    const value = rawValue as AnyRecord | string | number | boolean | null;

    if (value === null) {
      next = next.is(column, null);
      continue;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      if ("in" in value) {
        next = next.in(column, value.in as unknown[]);
        continue;
      }

      if ("gte" in value) {
        next = next.gte(column, serializeValue(value.gte));
        continue;
      }

      if ("startsWith" in value) {
        next = next.ilike(column, `${String(value.startsWith)}%`);
      }

      continue;
    }

    next = next.eq(column, value);
  }

  return next;
}

function sortRows<T extends AnyRecord>(rows: T[], orderBy?: Record<string, "asc" | "desc">) {
  if (!orderBy) {
    return rows;
  }

  const [field, direction] = Object.entries(orderBy)[0] ?? [];
  if (!field) {
    return rows;
  }

  const multiplier = direction === "desc" ? -1 : 1;

  return [...rows].sort((left, right) => {
    const leftValue = left[field];
    const rightValue = right[field];

    if (leftValue instanceof Date && rightValue instanceof Date) {
      return (leftValue.getTime() - rightValue.getTime()) * multiplier;
    }

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * multiplier;
    }

    return String(leftValue ?? "").localeCompare(String(rightValue ?? "")) * multiplier;
  });
}

async function matchesWhere(model: ModelName, row: AnyRecord, where?: Record<string, unknown>): Promise<boolean> {
  if (!where) {
    return true;
  }

  for (const [key, rawValue] of Object.entries(where)) {
    if (key === "project" && model === "asset") {
      const projectId = row.projectId;
      if (typeof projectId !== "string") {
        return false;
      }

      const project = await runFindUnique("project", { where: { id: projectId } });
      if (!project || !(await matchesWhere("project", project, rawValue as Record<string, unknown>))) {
        return false;
      }
      continue;
    }

    const value = rawValue as AnyRecord | string | number | boolean | Date | null;
    const fieldValue = row[key];

    if (value === null) {
      if (fieldValue !== null) {
        return false;
      }
      continue;
    }

    if (value instanceof Date) {
      if (!(fieldValue instanceof Date) || fieldValue.getTime() !== value.getTime()) {
        return false;
      }
      continue;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      if ("in" in value) {
        if (!(value.in as unknown[]).includes(fieldValue)) {
          return false;
        }
        continue;
      }

      if ("gte" in value) {
        const left = fieldValue instanceof Date ? fieldValue.getTime() : new Date(String(fieldValue)).getTime();
        const right = value.gte instanceof Date ? value.gte.getTime() : new Date(String(value.gte)).getTime();
        if (Number.isNaN(left) || Number.isNaN(right) || left < right) {
          return false;
        }
        continue;
      }

      if ("startsWith" in value) {
        if (typeof fieldValue !== "string" || !fieldValue.startsWith(String(value.startsWith))) {
          return false;
        }
        continue;
      }
    }

    if (fieldValue !== value) {
      return false;
    }
  }

  return true;
}

async function fetchRows(model: ModelName, args: QueryArgs = {}) {
  if (model === "workspace" && typeof args.where?.id === "string") {
    await ensureWorkspaceExists(args.where.id);
  }

  const supabase = getSupabaseAdmin();
  let query = supabase.from(TABLES[model]).select("*");

  query = applyDirectFilters(query, args.where);

  if (args.orderBy) {
    const [field, direction] = Object.entries(args.orderBy)[0] ?? [];
    if (field) {
      query = query.order(camelToSnake(field), { ascending: direction !== "desc" });
    }
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  let rows = (data ?? []).map((row) => normalizeRecord(row as Record<string, unknown>));

  if (args.where) {
    const filtered: AnyRecord[] = [];
    for (const row of rows) {
      if (await matchesWhere(model, row, args.where)) {
        filtered.push(row);
      }
    }
    rows = filtered;
  }

  rows = sortRows(rows, args.orderBy);

  if (args.take != null) {
    rows = rows.slice(0, args.take);
  }

  return rows;
}

async function resolveProjectRelation(
  key: "assets" | "jobs" | "exports",
  projectId: string,
  relationArgs: AnyRecord,
) {
  if (key === "assets") {
    return runFindMany("asset", {
      where: { projectId },
      select: relationArgs.select as Record<string, unknown>,
      orderBy: relationArgs.orderBy as Record<string, "asc" | "desc"> | undefined,
      take: relationArgs.take as number | undefined,
    });
  }

  if (key === "jobs") {
    return runFindMany("generationJob", {
      where: { projectId },
      select: relationArgs.select as Record<string, unknown>,
      orderBy: relationArgs.orderBy as Record<string, "asc" | "desc"> | undefined,
      take: relationArgs.take as number | undefined,
    });
  }

  return runFindMany("exportArtifact", {
    where: { projectId },
    select: relationArgs.select as Record<string, unknown>,
    orderBy: relationArgs.orderBy as Record<string, "asc" | "desc"> | undefined,
    take: relationArgs.take as number | undefined,
  });
}

async function shapeRecord(model: ModelName, row: AnyRecord | null, select?: Record<string, unknown>) {
  if (!row) {
    return null;
  }

  if (!select) {
    return row;
  }

  const shaped: AnyRecord = {};

  for (const [key, value] of Object.entries(select)) {
    if (value === true) {
      shaped[key] = row[key];
      continue;
    }

    if (model === "project" && (key === "assets" || key === "jobs" || key === "exports")) {
      shaped[key] = await resolveProjectRelation(
        key as "assets" | "jobs" | "exports",
        String(row.id),
        value as AnyRecord,
      );
    }
  }

  return shaped;
}

async function runFindMany(model: ModelName, args: QueryArgs = {}) {
  const rows = await fetchRows(model, args);
  const output: AnyRecord[] = [];

  for (const row of rows) {
    output.push((await shapeRecord(model, row, args.select)) as AnyRecord);
  }

  return output;
}

async function runFindUnique(model: ModelName, args: QueryArgs = {}) {
  const rows = await fetchRows(model, { ...args, take: 1 });
  return shapeRecord(model, rows[0] ?? null, args.select);
}

async function runFindFirst(model: ModelName, args: QueryArgs = {}) {
  return runFindUnique(model, args);
}

async function runCreate(model: ModelName, args: QueryArgs) {
  const supabase = getSupabaseAdmin();
  const data = { ...(args.data ?? {}) };

  if (typeof data.workspaceId === "string") {
    await ensureWorkspaceExists(data.workspaceId);
  }

  const { data: inserted, error } = await supabase
    .from(TABLES[model])
    .insert(prepareData(data, model))
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return shapeRecord(model, normalizeRecord(inserted as Record<string, unknown>), args.select);
}

async function runUpdate(model: ModelName, args: QueryArgs) {
  const supabase = getSupabaseAdmin();
  const where = args.where ?? {};
  const id = where.id;

  if (typeof id !== "string") {
    throw new Error(`Unsupported update on ${model}: only id-based updates are implemented.`);
  }

  const { data, error } = await supabase
    .from(TABLES[model])
    .update(prepareData(args.data ?? {}, model))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return shapeRecord(model, data ? normalizeRecord(data as Record<string, unknown>) : null, args.select);
}

async function runDelete(model: ModelName, args: QueryArgs) {
  const supabase = getSupabaseAdmin();
  const id = args.where?.id;

  if (typeof id !== "string") {
    throw new Error(`Unsupported delete on ${model}: only id-based deletes are implemented.`);
  }

  const { data, error } = await supabase
    .from(TABLES[model])
    .delete()
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return shapeRecord(model, data ? normalizeRecord(data as Record<string, unknown>) : null, args.select);
}

async function runDeleteMany(model: ModelName, args: QueryArgs) {
  const rows = await fetchRows(model, args);
  const supabase = getSupabaseAdmin();

  if (rows.length === 0) {
    return { count: 0 };
  }

  const ids = rows.map((row) => row.id).filter((value): value is string => typeof value === "string");
  const { error } = await supabase.from(TABLES[model]).delete().in("id", ids);

  if (error) {
    throw error;
  }

  return { count: ids.length };
}

async function runUpdateMany(model: ModelName, args: QueryArgs) {
  const rows = await fetchRows(model, args);
  let count = 0;

  for (const row of rows) {
    const id = row.id;
    if (typeof id === "string") {
      await runUpdate(model, { where: { id }, data: args.data ?? {} });
      count += 1;
    }
  }

  return { count };
}

async function runCount(model: ModelName, args: QueryArgs = {}) {
  const rows = await fetchRows(model, args);
  return rows.length;
}

async function runAggregate(model: ModelName, args: AggregateArgs) {
  const rows = await fetchRows(model, args);
  const sumFields = Object.keys(args._sum ?? {});
  const _sum: Record<string, number | null> = {};

  for (const field of sumFields) {
    const numericValues = rows
      .map((row) => row[field])
      .filter((value): value is number => typeof value === "number");

    _sum[field] = numericValues.length > 0
      ? numericValues.reduce((total, value) => total + value, 0)
      : null;
  }

  return { _sum };
}

function createModel(model: ModelName) {
  return {
    findUnique(args: QueryArgs) {
      return createDeferred(() => runFindUnique(model, args));
    },
    findFirst(args: QueryArgs) {
      return createDeferred(() => runFindFirst(model, args));
    },
    findMany(args?: QueryArgs) {
      return createDeferred(() => runFindMany(model, args ?? {}));
    },
    create(args: QueryArgs) {
      return createDeferred(() => runCreate(model, args));
    },
    update(args: QueryArgs) {
      return createDeferred(() => runUpdate(model, args));
    },
    updateMany(args: QueryArgs) {
      return createDeferred(() => runUpdateMany(model, args));
    },
    delete(args: QueryArgs) {
      return createDeferred(() => runDelete(model, args));
    },
    deleteMany(args: QueryArgs) {
      return createDeferred(() => runDeleteMany(model, args));
    },
    count(args?: QueryArgs) {
      return createDeferred(() => runCount(model, args ?? {}));
    },
    aggregate(args: AggregateArgs) {
      return createDeferred(() => runAggregate(model, args));
    },
  };
}

export const prisma = {
  workspace: createModel("workspace"),
  project: createModel("project"),
  asset: createModel("asset"),
  generationJob: createModel("generationJob"),
  exportArtifact: createModel("exportArtifact"),
  usageLedger: createModel("usageLedger"),
  composeTemplate: createModel("composeTemplate"),
  async $transaction<T>(
    input: Promise<T>[] | ((tx: typeof prisma) => Promise<T>),
  ): Promise<T[] | T> {
    if (typeof input === "function") {
      return input(prisma);
    }

    const results: T[] = [];
    for (const operation of input) {
      results.push(await operation);
    }
    return results;
  },
};
