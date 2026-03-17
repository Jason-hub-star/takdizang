-- Takdizang seed data: sample projects, assets, templates, usage, jobs, exports
-- Assumes the workspace 'default-workspace' already exists from the core migration.

-- Update workspace name
update public.workspaces
set name = 'Takdi Studio'
where id = 'default-workspace';

-- 8 sample projects (diverse modes and statuses)
insert into public.projects (id, workspace_id, name, status, mode, editor_mode, brief_text, created_at, updated_at) values
  ('proj-001', 'default-workspace', '봄 신상 원피스 상세페이지',   'exported',    'compose',          'compose', '플로럴 원피스 시즌 런칭용 상세페이지',                  now() - interval '12 days', now() - interval '1 day'),
  ('proj-002', 'default-workspace', '립스틱 숏폼 광고',            'exported',    'shortform-video',   'flow',    '신규 컬러 3종 15초 숏폼',                               now() - interval '10 days', now() - interval '2 days'),
  ('proj-003', 'default-workspace', '여름 샌들 모델컷',            'generated',   'model-shot',        'flow',    '스튜디오 배경 합성 모델컷 4장',                          now() - interval '8 days',  now() - interval '3 days'),
  ('proj-004', 'default-workspace', '가방 누끼 배치',              'generated',   'cutout',            'flow',    '크로스백 5종 누끼 + 배경 제거',                          now() - interval '7 days',  now() - interval '3 days'),
  ('proj-005', 'default-workspace', '브랜드 배너 이미지',          'draft',       'brand-image',       'flow',    '메인 배너용 브랜드 이미지 3종',                          now() - interval '5 days',  now() - interval '4 days'),
  ('proj-006', 'default-workspace', '운동화 GIF 소스',             'generating',  'gif-source',        'flow',    '360도 회전 GIF용 프레임 생성',                           now() - interval '4 days',  now() - interval '4 days'),
  ('proj-007', 'default-workspace', '향수 자유형 실험',            'draft',       'freeform',          'flow',    '향수 비주얼 컨셉 자유 실험',                             now() - interval '3 days',  now() - interval '2 days'),
  ('proj-008', 'default-workspace', '가을 니트 상세페이지',        'draft',       'compose',           'compose', '캐시미어 니트 가을 시즌 상세페이지 초안',                 now() - interval '1 day',   now() - interval '1 hour')
on conflict (id) do nothing;

-- 10 assets across projects
insert into public.assets (id, project_id, source_type, file_path, mime_type, created_at) values
  ('asset-001', 'proj-001', 'uploaded',  'uploads/proj-001/hero-dress.jpg',       'image/jpeg',  now() - interval '11 days'),
  ('asset-002', 'proj-001', 'uploaded',  'uploads/proj-001/detail-fabric.jpg',    'image/jpeg',  now() - interval '11 days'),
  ('asset-003', 'proj-002', 'uploaded',  'uploads/proj-002/lipstick-swatch.png',  'image/png',   now() - interval '9 days'),
  ('asset-004', 'proj-002', 'generated', 'uploads/proj-002/shortform-out.mp4',    'video/mp4',   now() - interval '8 days'),
  ('asset-005', 'proj-003', 'uploaded',  'uploads/proj-003/model-raw-01.jpg',     'image/jpeg',  now() - interval '7 days'),
  ('asset-006', 'proj-003', 'generated', 'uploads/proj-003/model-composite.jpg',  'image/jpeg',  now() - interval '6 days'),
  ('asset-007', 'proj-004', 'uploaded',  'uploads/proj-004/bag-photo-01.jpg',     'image/jpeg',  now() - interval '6 days'),
  ('asset-008', 'proj-004', 'generated', 'uploads/proj-004/bag-cutout-01.png',    'image/png',   now() - interval '5 days'),
  ('asset-009', 'proj-006', 'uploaded',  'uploads/proj-006/sneaker-frame-01.jpg', 'image/jpeg',  now() - interval '3 days'),
  ('asset-010', 'proj-008', 'uploaded',  'uploads/proj-008/knit-hero.jpg',        'image/jpeg',  now() - interval '1 day')
on conflict (id) do nothing;

-- 3 compose templates
insert into public.compose_templates (id, workspace_id, name, snapshot, preview_title, block_count, source_project_id, created_at, updated_at) values
  ('tmpl-001', 'default-workspace', '기본 상세페이지 템플릿', '{"blocks":[]}', '히어로 + 상세 + CTA 구성', 6, 'proj-001', now() - interval '10 days', now() - interval '2 days'),
  ('tmpl-002', 'default-workspace', '미니멀 상세 템플릿',     '{"blocks":[]}', '이미지 중심 간결 레이아웃', 4, null,       now() - interval '8 days',  now() - interval '5 days'),
  ('tmpl-003', 'default-workspace', '프로모션 랜딩 템플릿',   '{"blocks":[]}', '할인 배너 + 후기 섹션',     8, null,       now() - interval '6 days',  now() - interval '3 days')
on conflict (id) do nothing;

-- 12 usage_ledger events
insert into public.usage_ledger (id, workspace_id, event_type, detail, cost_estimate, created_at) values
  ('usage-001', 'default-workspace', 'generation_start',       '{"projectId":"proj-001"}', 0.03,  now() - interval '11 days'),
  ('usage-002', 'default-workspace', 'image_generation_start', '{"projectId":"proj-001"}', 0.05,  now() - interval '11 days'),
  ('usage-003', 'default-workspace', 'export_complete',        '{"projectId":"proj-001"}', 0.00,  now() - interval '10 days'),
  ('usage-004', 'default-workspace', 'generation_start',       '{"projectId":"proj-002"}', 0.04,  now() - interval '9 days'),
  ('usage-005', 'default-workspace', 'export_start',           '{"projectId":"proj-002"}', 0.00,  now() - interval '8 days'),
  ('usage-006', 'default-workspace', 'export_complete',        '{"projectId":"proj-002"}', 0.00,  now() - interval '8 days'),
  ('usage-007', 'default-workspace', 'model_compose_start',    '{"projectId":"proj-003"}', 0.12,  now() - interval '7 days'),
  ('usage-008', 'default-workspace', 'remove_bg_start',        '{"projectId":"proj-004"}', 0.02,  now() - interval '6 days'),
  ('usage-009', 'default-workspace', 'export_complete',        '{"projectId":"proj-004"}', 0.00,  now() - interval '5 days'),
  ('usage-010', 'default-workspace', 'image_generation_start', '{"projectId":"proj-005"}', 0.08,  now() - interval '4 days'),
  ('usage-011', 'default-workspace', 'generation_start',       '{"projectId":"proj-006"}', 0.06,  now() - interval '3 days'),
  ('usage-012', 'default-workspace', 'generation_start',       '{"projectId":"proj-008"}', 0.03,  now() - interval '1 day')
on conflict (id) do nothing;

-- 4 generation_jobs
insert into public.generation_jobs (id, project_id, status, provider, input, output, started_at, done_at, created_at) values
  ('job-001', 'proj-001', 'done',    'gemini',  '{"prompt":"봄 원피스 문안"}',    '{"text":"화사한 플로럴..."}',  now() - interval '11 days', now() - interval '11 days', now() - interval '11 days'),
  ('job-002', 'proj-002', 'done',    'gemini',  '{"prompt":"립스틱 스크립트"}',    '{"text":"선명한 발색..."}',    now() - interval '9 days',  now() - interval '9 days',  now() - interval '9 days'),
  ('job-003', 'proj-003', 'done',    'kie',     '{"prompt":"모델컷 합성"}',        '{"url":"model-composite"}',   now() - interval '7 days',  now() - interval '7 days',  now() - interval '7 days'),
  ('job-004', 'proj-006', 'running', 'gemini',  '{"prompt":"운동화 GIF 프레임"}',  null,                          now() - interval '3 days',  null,                       now() - interval '3 days')
on conflict (id) do nothing;

-- 3 export_artifacts
insert into public.export_artifacts (id, project_id, type, file_path, metadata, created_at) values
  ('export-001', 'proj-001', 'html',  'exports/proj-001/detail-page.html', '{"pages":1}',  now() - interval '10 days'),
  ('export-002', 'proj-002', 'video', 'exports/proj-002/shortform.mp4',    '{"duration":15,"fps":30}', now() - interval '8 days'),
  ('export-003', 'proj-004', 'zip',   'exports/proj-004/cutouts.zip',      '{"fileCount":5}', now() - interval '5 days')
on conflict (id) do nothing;
