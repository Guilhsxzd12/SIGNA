# SIGNA Gestão

Sistema de gestão empresarial reconstruído com interface moderna, inspirado na organização do software de referência enviado pelo usuário e preparado para uso no Windows pelo navegador.

## Funcionalidades implementadas

- Dashboard com faturamento, lucro bruto estimado, contas a pagar, vendas do dia e estoque baixo.
- PDV com busca de produtos, carrinho, quantidades, desconto, cliente, forma de pagamento e baixa automática de estoque.
- Orçamentos, com conversão posterior em venda.
- Cadastro de produtos com custo, estoque, estoque mínimo, categoria e unidade.
- Margem de lucro global ou personalizada por produto.
- Custos automáticos por item: embalagem e outros custos.
- Preços automáticos para Pix, dinheiro e cartão em até 4x.
- Taxas de pagamento configuráveis.
- Cadastro de clientes.
- Contas a pagar e baixa de despesas.
- Ordens de serviço.
- Relatórios básicos de vendas e produtos mais vendidos.
- Persistência local no navegador com localStorage.
- Estrutura SQL inicial em supabase/schema.sql para a próxima etapa.

## Precificação

O sistema considera:

1. Custo de compra.
2. Custo de embalagem.
3. Outros custos.
4. Margem desejada.
5. Taxa da forma de pagamento.

Preço-base = custo total / (1 - margem percentual)

Depois, a taxa do pagamento é compensada no preço para que a margem desejada não seja consumida pela operadora.

## Rodar no Windows

Instale o Node.js LTS e, dentro da pasta do projeto, execute:

npm install
npm run dev

Depois acesse http://localhost:3000

## Próximas integrações

O projeto já está estruturado para receber Supabase e Vercel. A próxima etapa pode incluir login, banco em nuvem, múltiplos usuários, permissões, sincronização e backup.

## Fiscal

A emissão real de NF-e, NFC-e ou NFS-e ainda não está conectada. Essa função exige integração fiscal própria, regras tributárias corretas e, dependendo do emissor escolhido, certificado digital e credenciais. O sistema não deve simular transmissão à SEFAZ sem uma integração real.
