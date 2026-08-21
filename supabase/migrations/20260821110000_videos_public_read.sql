-- Lecture publique des témoignages vidéo (embeds Facebook) sur la homepage.

CREATE POLICY "Lecture publique videos"
ON public.videos FOR SELECT TO public USING (true);
