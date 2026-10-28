DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'ingresos'
  ) THEN
    RAISE EXCEPTION 'No existe la tabla public.ingresos.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'users'
  ) THEN
    RAISE EXCEPTION 'No existe la tabla public.users.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.ingresos) THEN
    RAISE EXCEPTION 'La migración requiere que public.ingresos esté vacía.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'id'
      AND data_type = 'bigint'
  ) THEN
    RAISE EXCEPTION 'Se esperaba que public.users.id fuera de tipo BIGINT.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ingresos'
      AND column_name = 'usuario_id'
  ) THEN
    ALTER TABLE public.ingresos
      ADD COLUMN usuario_id BIGINT NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ingresos'
      AND column_name = 'cliente'
  ) THEN
    ALTER TABLE public.ingresos DROP COLUMN cliente;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_ingresos_users'
      AND conrelid = 'public.ingresos'::regclass
  ) THEN
    ALTER TABLE public.ingresos
      ADD CONSTRAINT fk_ingresos_users
      FOREIGN KEY (usuario_id)
      REFERENCES public.users(id)
      ON DELETE RESTRICT;
  END IF;
END
$$;
