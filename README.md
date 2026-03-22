# Lanchinhos

Aplicação Next.js para organizar receitas rápidas com suporte offline e agora persistência em PostgreSQL (Neon).

## Pré-requisitos

- Node.js 18+
- Banco PostgreSQL compatível com conexões TLS (o projeto usa Neon)

## Configuração rápida

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo de exemplo de variáveis de ambiente:

   ```bash
   cp .env.local.example .env.local
   ```

3. Edite `.env.local` preenchendo `DATABASE_URL`. Cole a string fornecida pelo Neon (a mesma compartilhada aqui) ou outra credencial com este formato:

   ```env
   DATABASE_URL="postgresql://usuario:senha@host/base?sslmode=require&channel_binding=require"
   ```

4. Crie a tabela necessária (uma vez) na instância Postgres. Execute o SQL abaixo no painel da Neon ou via `psql`:

   ```sql
   CREATE TABLE IF NOT EXISTS recipes (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     ingredients JSONB NOT NULL,
     preparo TEXT NOT NULL,
     finalizacao TEXT NOT NULL,
     favorite BOOLEAN DEFAULT FALSE,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```

   Opcionalmente, insira algumas receitas iniciais:

   ```sql
   INSERT INTO recipes (id, name, ingredients, preparo, finalizacao, favorite)
   VALUES
     ('pao-queijo', 'Pão de queijo rápido', '["2 xícaras de polvilho doce","1 xícara de queijo meia cura","2 ovos","1/2 xícara de leite morno"]',
      'Misture tudo até formar massa lisa. Faça bolinhas e asse em forno alto por 15 minutos até dourar.',
      'Sirva quente com manteiga leve.', true)
   ON CONFLICT (id) DO NOTHING;
   ```

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

A UI cliente agora consome `/api/recipes`, então qualquer alteração (criar, editar, favoritar, excluir) é persistida diretamente no banco informado acima.
