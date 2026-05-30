insert ignore into categories (id, name, created_at, created_by) values
('cat-frontend', '前端', '2026-05-28 10:00:00', 'Ming'),
('cat-system', '系统设计', '2026-05-27 10:00:00', 'Jia'),
('cat-basic', '计算机基础', '2026-05-26 10:00:00', 'Lan');

insert ignore into questions (id, title, body, category_id, uploader_name, uploaded_at, source_url, answer, answer_author, answered_at) values
('q-1', '为什么 React 列表渲染时需要稳定的 key？', '请从 diff 过程、组件状态复用、列表重排三个角度解释。再说明使用数组下标作为 key 会在哪些场景里出问题。', 'cat-frontend', 'Ming', '2026-05-29 08:30:00', null, '稳定 key 能让框架在新旧子节点之间建立可靠映射。列表插入、删除或重排时，如果 key 跟随业务实体而不是位置变化，React 就能复用正确的 DOM 和组件实例。数组下标作为 key 在纯追加列表里通常问题不大，但在中间插入、筛选、排序时会让旧状态错配到新数据上。', 'Jia', '2026-05-29 09:00:00'),
('q-2', '如何设计一个支持热点文章排行榜的缓存方案？', '假设读取量很高，写入量中等，要求榜单尽量实时，但允许数秒延迟。请说明缓存结构、更新策略和降级方案。', 'cat-system', 'Lan', '2026-05-28 08:30:00', null, null, null, null);

insert ignore into question_tags (question_id, tag_order, tag_value) values
('q-1', 0, 'React'),
('q-1', 1, '渲染'),
('q-1', 2, '状态'),
('q-2', 0, '缓存'),
('q-2', 1, '排行榜');
