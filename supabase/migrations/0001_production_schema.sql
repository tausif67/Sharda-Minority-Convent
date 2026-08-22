-- Sharda Minority Convent production schema
-- Run in a new Supabase project before creating the first application user.

create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'teacher', 'student', 'parent');

create table public.school_settings (
  id uuid primary key default gen_random_uuid(),
  school_name text not null default 'Sharda Minority Convent',
  academic_year text not null default '2026-27',
  address text,
  phone text,
  email text,
  logo_url text,
  updated_at timestamptz not null default now()
);

insert into public.school_settings (school_name, academic_year)
values ('Sharda Minority Convent', '2026-27');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'New User',
  role public.app_role not null default 'student',
  email text,
  phone text,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  admission_no text not null unique,
  full_name text not null,
  date_of_birth date,
  class_name text not null,
  section text not null default 'A',
  roll_no integer not null default 0,
  guardian_name text,
  guardian_phone text,
  fee_due numeric(12,2) not null default 0 check (fee_due >= 0),
  status text not null default 'active' check (status in ('active', 'inactive', 'alumni')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_guardians (
  student_id uuid not null references public.students(id) on delete cascade,
  guardian_user_id uuid not null references auth.users(id) on delete cascade,
  relationship text not null default 'Guardian',
  primary key (student_id, guardian_user_id)
);

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  employee_id text not null unique,
  full_name text not null,
  designation text not null,
  email text,
  phone text,
  salary numeric(12,2) not null default 0 check (salary >= 0),
  joined_at date,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  student_name text not null,
  class_name text,
  attendance_date date not null default current_date,
  status text not null check (status in ('present', 'absent', 'leave')),
  marked_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (student_id, attendance_date)
);

create table public.fees (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  student_name text not null,
  receipt_no text not null unique,
  amount numeric(12,2) not null check (amount > 0),
  method text not null check (method in ('UPI', 'Cash', 'Card', 'Bank transfer')),
  paid_at date not null default current_date,
  collected_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.exam_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  student_name text not null,
  exam text not null,
  subject text not null,
  marks numeric(7,2) not null check (marks >= 0),
  max_marks numeric(7,2) not null default 100 check (max_marks > 0),
  grade text not null,
  entered_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.homework (
  id uuid primary key default gen_random_uuid(),
  class_name text not null,
  subject text not null,
  title text not null,
  description text,
  due_date date not null,
  teacher_name text not null,
  status text not null default 'assigned' check (status in ('assigned', 'closed')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all' check (audience in ('all', 'students', 'parents', 'staff')),
  priority text not null default 'normal' check (priority in ('normal', 'important')),
  published_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.timetable (
  id uuid primary key default gen_random_uuid(),
  day text not null,
  period integer not null,
  class_name text not null,
  subject text not null,
  teacher_name text not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  unique (day, period, class_name)
);

create table public.payroll (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete restrict,
  salary_month date not null,
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'paid' check (status in ('paid', 'pending')),
  processed_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  unique (staff_id, salary_month)
);

create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  import_type text not null check (import_type in ('students', 'staff')),
  filename text not null,
  row_count integer not null default 0,
  status text not null check (status in ('completed', 'failed')),
  imported_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null default auth.uid(),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email, new.phone, 'New User'),
    'student',
    new.email,
    new.phone
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and status = 'active'
$$;

create or replace function public.complete_password_change()
returns void language sql security definer set search_path = public as $$
  update public.profiles
  set must_change_password = false, updated_at = now()
  where id = auth.uid()
$$;

create or replace function public.can_access_student(target_student uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.students s
    where s.id = target_student and (
      public.current_role() in ('admin', 'teacher')
      or s.user_id = auth.uid()
      or exists (
        select 1 from public.student_guardians sg
        where sg.student_id = s.id and sg.guardian_user_id = auth.uid()
      )
    )
  )
$$;

create or replace function public.apply_fee_payment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.students
  set fee_due = greatest(0, fee_due - new.amount), updated_at = now()
  where id = new.student_id;
  return new;
end;
$$;

create trigger after_fee_payment
after insert on public.fees for each row execute procedure public.apply_fee_payment();

alter table public.school_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.student_guardians enable row level security;
alter table public.staff enable row level security;
alter table public.attendance enable row level security;
alter table public.fees enable row level security;
alter table public.exam_results enable row level security;
alter table public.homework enable row level security;
alter table public.notices enable row level security;
alter table public.timetable enable row level security;
alter table public.payroll enable row level security;
alter table public.import_jobs enable row level security;
alter table public.audit_logs enable row level security;

create policy "authenticated read school settings" on public.school_settings for select to authenticated using (true);
create policy "admin update school settings" on public.school_settings for update to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "read own profile or admin" on public.profiles for select to authenticated using (id = auth.uid() or public.current_role() = 'admin');
create policy "admin update profiles" on public.profiles for update to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "role based student read" on public.students for select to authenticated using (public.can_access_student(id));
create policy "admin insert students" on public.students for insert to authenticated with check (public.current_role() = 'admin');
create policy "admin update students" on public.students for update to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admin delete students" on public.students for delete to authenticated using (public.current_role() = 'admin');

create policy "guardian link read" on public.student_guardians for select to authenticated using (guardian_user_id = auth.uid() or public.current_role() = 'admin');
create policy "admin manage guardian links" on public.student_guardians for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "admin staff read" on public.staff for select to authenticated using (public.current_role() = 'admin');
create policy "admin staff insert" on public.staff for insert to authenticated with check (public.current_role() = 'admin');
create policy "admin staff update" on public.staff for update to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admin staff delete" on public.staff for delete to authenticated using (public.current_role() = 'admin');

create policy "student attendance read" on public.attendance for select to authenticated using (public.can_access_student(student_id));
create policy "staff insert attendance" on public.attendance for insert to authenticated with check (public.current_role() in ('admin', 'teacher'));
create policy "staff update attendance" on public.attendance for update to authenticated using (public.current_role() in ('admin', 'teacher')) with check (public.current_role() in ('admin', 'teacher'));

create policy "student fees read" on public.fees for select to authenticated using (public.can_access_student(student_id));
create policy "admin insert fees" on public.fees for insert to authenticated with check (public.current_role() = 'admin');

create policy "student results read" on public.exam_results for select to authenticated using (public.can_access_student(student_id));
create policy "staff insert results" on public.exam_results for insert to authenticated with check (public.current_role() in ('admin', 'teacher'));
create policy "staff update results" on public.exam_results for update to authenticated using (public.current_role() in ('admin', 'teacher')) with check (public.current_role() in ('admin', 'teacher'));

create policy "authenticated read homework" on public.homework for select to authenticated using (true);
create policy "staff manage homework" on public.homework for all to authenticated using (public.current_role() in ('admin', 'teacher')) with check (public.current_role() in ('admin', 'teacher'));
create policy "authenticated read notices" on public.notices for select to authenticated using (true);
create policy "staff manage notices" on public.notices for all to authenticated using (public.current_role() in ('admin', 'teacher')) with check (public.current_role() in ('admin', 'teacher'));
create policy "authenticated read timetable" on public.timetable for select to authenticated using (true);
create policy "admin manage timetable" on public.timetable for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy "admin manage payroll" on public.payroll for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admin manage imports" on public.import_jobs for all to authenticated using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy "admin read audit" on public.audit_logs for select to authenticated using (public.current_role() = 'admin');
create policy "authenticated create audit" on public.audit_logs for insert to authenticated with check (actor_id = auth.uid());

create index students_class_idx on public.students (class_name, section);
create index attendance_date_idx on public.attendance (attendance_date desc);
create index attendance_student_idx on public.attendance (student_id);
create index fees_student_idx on public.fees (student_id);
create index results_student_idx on public.exam_results (student_id);
create index homework_class_idx on public.homework (class_name, due_date);
create index notices_published_idx on public.notices (published_at desc);

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.complete_password_change() to authenticated;
