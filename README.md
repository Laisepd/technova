# TechNova — Web Commerce de TI

Site **100% estático** (HTML5 + CSS3 + JavaScript puro) pronto para rodar no **GitHub Pages**.

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub e envie **o conteúdo desta pasta `public/`** para a raiz do repositório (ou mantenha a pasta `public/` e configure o Pages para servir a partir dela).
2. Em **Settings → Pages**, selecione a branch `main` (ou `gh-pages`) e a pasta `/ (root)` (ou `/public`).
3. Acesse `https://<seu-usuario>.github.io/<repo>/`.

## Estrutura

```
public/
  index.html        ← Página inicial (hero, categorias, destaques, ofertas)
  catalogo.html     ← Catálogo de produtos
  servicos.html     ← Serviços (formatação, manutenção, redes, segurança...)
  locacao.html      ← Locação (notebooks, projetores, servidores, roteadores)
  carrinho.html     ← Carrinho com frete fictício
  login.html        ← Login
  cadastro.html     ← Cadastro
  recuperar.html    ← Recuperação de senha (simulada)
  conta.html        ← Painel: pedidos, serviços, dados cadastrais
  css/styles.css    ← Design system (cyber purple)
  js/data.js        ← Catálogo (produtos/serviços/locação)
  js/app.js         ← Carrinho, auth e UI (localStorage)
  img/hero.jpg
```

## Requisitos funcionais atendidos

- ✅ Página inicial (banner, destaques, categorias, ofertas)
- ✅ Catálogo (nome, foto, descrição, valor, avaliação)
- ✅ Serviços (formatação, manutenção, redes, cabeamento, segurança…)
- ✅ Locação (notebooks, projetores, servidores, roteadores…)
- ✅ Carrinho (add/remove, cálculo automático, frete fictício)
- ✅ Login, cadastro e recuperação de senha (simulada)
- ✅ Painel do cliente (pedidos, serviços, dados cadastrais)
- ✅ HTML5 + CSS3 + JavaScript, responsivo, acessibilidade básica