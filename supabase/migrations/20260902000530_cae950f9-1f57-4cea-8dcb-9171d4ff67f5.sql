CREATE OR REPLACE FUNCTION public.lock_profile_progression()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    NEW.xp := OLD.xp;
    NEW.level := OLD.level;
    NEW.coins := OLD.coins;
    NEW.current_streak := OLD.current_streak;
    NEW.longest_streak := OLD.longest_streak;
    NEW.total_minutes := OLD.total_minutes;
    NEW.last_study_date := OLD.last_study_date;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.lock_profile_progression() FROM PUBLIC;

CREATE OR REPLACE FUNCTION private.record_focus_session(_minutes integer, _background text DEFAULT NULL)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _uid uuid := auth.uid();
  _today date := current_date;
  _yesterday date := current_date - 1;
  _profile public.profiles;
  _streak integer;
  _xp integer;
  _coins integer;
BEGIN
  IF _uid IS NULL OR _minutes IS NULL OR _minutes < 1 OR _minutes > 1440 THEN
    RAISE EXCEPTION 'Invalid focus session';
  END IF;

  SELECT * INTO _profile FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF _profile.id IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  INSERT INTO public.focus_sessions (user_id, minutes, mode, background)
  VALUES (_uid, _minutes, 'focus', _background);

  _streak := CASE
    WHEN _profile.last_study_date = _today THEN COALESCE(_profile.current_streak, 1)
    WHEN _profile.last_study_date = _yesterday THEN COALESCE(_profile.current_streak, 0) + 1
    ELSE 1
  END;
  _xp := COALESCE(_profile.xp, 0) + (_minutes * 2);
  _coins := COALESCE(_profile.coins, 0) + round(_minutes::numeric / 5)::integer;

  UPDATE public.profiles
  SET xp = _xp,
      level = floor(sqrt(greatest(0, _xp)::numeric / 25))::integer + 1,
      coins = _coins,
      current_streak = _streak,
      longest_streak = greatest(COALESCE(_profile.longest_streak, 0), _streak),
      total_minutes = COALESCE(_profile.total_minutes, 0) + _minutes,
      last_study_date = _today
  WHERE id = _uid
  RETURNING * INTO _profile;

  RETURN _profile;
END;
$$;

REVOKE ALL ON FUNCTION private.record_focus_session(integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.record_focus_session(integer, text) TO authenticated;

DROP FUNCTION IF EXISTS public.record_focus_session(integer, text);