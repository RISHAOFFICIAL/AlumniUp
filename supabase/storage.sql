-- Storage configuration for funding-need photos.
--
-- Bucket: need-photos
-- Holds one optional photo per funding need. Per the submission attestation,
-- no photo may contain student faces or personally identifiable student
-- information.

-- Public bucket: approved/active need photos are served on the public site.
insert into storage.buckets (id, name, public)
values ('need-photos', 'need-photos', true)
on conflict (id) do nothing;

-- Public read — donors and site visitors can view need photos.
create policy "need-photos public read"
  on storage.objects for select
  using (bucket_id = 'need-photos');

-- Uploads are performed server-side with the service-role key
-- (POST /api/needs/submit), which bypasses RLS, so no INSERT policy is granted
-- to the anon or authenticated roles. This keeps unauthenticated uploads off.
