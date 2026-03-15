insert into storage.buckets (id, name, public)
values
  ('project-assets', 'project-assets', false),
  ('artifacts', 'artifacts', false),
  ('thumbnails', 'thumbnails', false)
on conflict (id) do nothing;
