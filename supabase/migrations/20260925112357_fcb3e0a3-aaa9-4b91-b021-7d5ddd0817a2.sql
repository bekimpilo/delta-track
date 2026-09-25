DROP POLICY IF EXISTS "Anyone can view indicator values" ON public.indicator_values;
DROP POLICY IF EXISTS "Anyone can view sub-activities" ON public.sub_activities;
DROP POLICY IF EXISTS "Anyone can view indicators" ON public.indicators;
CREATE POLICY "Admins can view indicator values" ON public.indicator_values FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view sub-activities" ON public.sub_activities FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view indicators" ON public.indicators FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));