-- Create matrix_tokens table
CREATE TABLE IF NOT EXISTS public.matrix_tokens (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    matrix_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    device_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT matrix_tokens_pkey PRIMARY KEY (user_id)
);

-- Create index for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS matrix_tokens_matrix_user_id_idx 
    ON public.matrix_tokens (matrix_user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_matrix_tokens_modtime 
    BEFORE UPDATE ON public.matrix_tokens
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();