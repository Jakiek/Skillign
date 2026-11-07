-- Pisahkan sumber nama organisasi dan topik publik dari atribut simulasi.
ALTER TABLE organisasi ADD COLUMN sumber_url TEXT;
ALTER TABLE tantangan ADD COLUMN sumber_url TEXT;
