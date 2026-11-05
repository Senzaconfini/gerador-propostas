/**
 * Monta o HTML da proposta a partir do conteúdo gerado pelo Claude.
 * O layout é fixo (estilo Senza Confini), o Claude só preenche o conteúdo.
 */

export type ConteudoProposta = {
  titulo_servico: string          // Ex: "Gestão de Tráfego Pago"
  empresa_cliente: string         // Ex: "Goulart Cabelos"
  nome_cliente: string            // Ex: "Alessandro"
  data: string                    // Ex: "Novembro de 2026"

  momento: {
    titulo: string                // Ex: "Chegou a hora de mais gente conhecer o seu trabalho"
    lead: string                  // parágrafo principal
    complemento: string           // parágrafo secundário (cinza)
  }

  o_que_e: {
    titulo: string                // Ex: "O que é tráfego pago"
    paragrafo: string
    pilares: string[]             // 3 itens curtos
  }

  metodo: {
    intro: string                 // Ex: "Vamos colocar a mão na massa..."
    faca: string                  // card Faça
    entenda: string               // card Entenda
    repita: string                // card Repita
  }

  passo_a_passo: string[]         // 5 a 8 passos

  planos: Array<{
    nome: string                  // Ex: "Plano Essencial"
    subtitulo: string             // Ex: "Para começar com o essencial"
    preco: string                 // Ex: "R$ 750"
    periodo: string               // Ex: "por mês"
    itens: string[]               // 3 a 6 itens
    ads?: string                  // opcional (linha final de observação)
    destaque?: boolean            // card com borda dourada + tag "Recomendado"
  }>

  nota_planos?: string            // observação abaixo dos planos

  fechamento: {
    label: string                 // Ex: "Vamos começar?"
    titulo: string                // Ex: "É só marcar a nossa conversa"
    subtitulo: string             // frase menor abaixo
    contato: string               // Ex: "(21) 96879-3651 · @senzaconfini_mkt"
  }
}

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function montarHtmlProposta(d: ConteudoProposta): string {
  const pilares = (d.o_que_e?.pilares || []).slice(0, 3)
  const passos = (d.passo_a_passo || []).slice(0, 8)
  const planos = (d.planos || []).slice(0, 2)
  const nPlanos = planos.length

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Proposta ${esc(d.empresa_cliente)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Archivo:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --green:#1E3320; --green-deep:#152417; --gold:#B89A5A; --gold-soft:#C9B47A;
    --cream:#F4EFE4; --paper:#FBF8F1; --ink:#262B24; --muted:#5E6657; --line:#D9CFB8;
  }
  *{ box-sizing:border-box; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  html,body{ margin:0; padding:0; background:#EDE7D8; color:var(--ink); font-family:'Archivo',sans-serif; line-height:1.55; }
  h1,h2,h3,.display{ font-family:'Newsreader',Georgia,serif; font-weight:500; }
  .label{ text-transform:uppercase; letter-spacing:.22em; font-size:11px; font-weight:600; color:var(--gold); margin-bottom:10px; }

  .deck{ display:flex; flex-direction:column; align-items:center; gap:22px; padding:26px 16px 40px; }
  .slide{
    width:100%; max-width:1060px; aspect-ratio:297/210; background:var(--paper);
    border:1px solid var(--line); border-radius:14px; overflow:hidden;
    box-shadow:0 14px 44px rgba(30,51,32,.12); display:flex;
  }
  .inner{ padding:48px 60px; width:100%; display:flex; flex-direction:column; justify-content:center; }
  .slide.green{ background:var(--green); color:var(--cream); border-color:var(--green); }
  .slide.green .label{ color:var(--gold-soft); }

  h2{ font-size:41px; color:var(--green); margin:0 0 18px; line-height:1.1; }
  p{ font-size:23px; margin:0 0 14px; line-height:1.5; }
  .muted{ color:var(--muted); }
  .lead{ font-size:26px; }

  .mark{ display:flex; align-items:center; gap:14px; margin-bottom:28px; }
  .mark .name{ font-family:'Newsreader',serif; font-size:21px; }
  .cover-h{ font-size:52px; color:#fff; line-height:1.05; margin:8px 0 4px; }
  .cover-sub{ font-family:'Newsreader',serif; font-size:27px; opacity:.95; }
  .cover-meta{ margin-top:30px; font-size:14.5px; color:var(--gold-soft); letter-spacing:.03em; }
  .cover-meta b{ color:#fff; }

  .pillars{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:22px; margin-top:30px; }
  .pillar{ text-align:center; background:var(--cream); border:1px solid var(--line); border-radius:14px; padding:30px 20px; box-shadow:0 10px 26px rgba(30,51,32,.12); }
  .pillar .k{ font-family:'Newsreader',serif; color:var(--gold); font-size:58px; line-height:1; }
  .pillar .v{ font-size:21px; color:var(--muted); margin-top:12px; }

  .flow{ display:grid; grid-template-columns:1fr auto 1fr auto 1fr; gap:12px; align-items:stretch; margin-top:26px; }
  .fcard{ background:var(--cream); border:1px solid var(--line); border-top:3px solid var(--gold); border-radius:12px; padding:22px 18px; text-align:center; }
  .fk{ font-family:'Newsreader',serif; color:var(--green); font-size:36px; margin-bottom:12px; }
  .fv{ font-size:20px; color:var(--muted); }
  .farrow{ align-self:center; color:var(--gold); font-size:30px; font-family:'Newsreader',serif; }

  .steps{ display:grid; grid-template-columns:1fr 1fr; gap:12px 40px; margin-top:16px; counter-reset:s; }
  .step{ display:flex; gap:14px; align-items:flex-start; }
  .step .n{ counter-increment:s; flex:0 0 auto; width:44px; height:44px; border-radius:50%; background:var(--green); color:var(--cream); font-family:'Newsreader',serif; font-size:22px; display:flex; align-items:center; justify-content:center; }
  .step .n::before{ content:counter(s); }
  .step .t{ font-size:20px; padding-top:8px; }

  .plans{ display:grid; grid-template-columns:${nPlanos === 1 ? '1fr' : '1fr 1fr'}; gap:20px; margin-top:6px; }
  .plan{ background:var(--cream); border:1px solid var(--line); border-radius:12px; padding:22px 22px; position:relative; }
  .plan.featured{ border:1.5px solid var(--gold); box-shadow:0 8px 22px rgba(30,51,32,.08); }
  .plan .tag{ position:absolute; top:-11px; right:18px; background:var(--gold); color:var(--green-deep); font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; padding:5px 10px; border-radius:20px; }
  .plan .pname{ font-family:'Newsreader',serif; font-size:27px; color:var(--green); }
  .plan .ptag{ font-size:16px; color:var(--muted); margin:2px 0 10px; }
  .plan .price{ font-family:'Newsreader',serif; color:var(--green); font-size:38px; line-height:1; }
  .plan .price span{ font-family:'Archivo',sans-serif; font-size:15px; color:var(--muted); font-weight:500; }
  .plan ul{ list-style:none; padding:0; margin:14px 0 0; }
  .plan li{ position:relative; padding:7px 0 7px 22px; font-size:17px; border-top:1px solid var(--line); }
  .plan li:first-child{ border-top:0; }
  .plan li::before{ content:""; position:absolute; left:2px; top:12px; width:6px; height:6px; border-radius:50%; background:var(--gold); }
  .plan .ads{ margin-top:12px; font-size:15px; color:var(--muted); border-top:1px dashed var(--line); padding-top:9px; }
  .note{ margin-top:16px; font-size:16.5px; color:var(--muted); text-align:center; }
  .note b{ color:var(--green); }

  .close-h{ font-family:'Newsreader',serif; font-size:46px; color:#fff; margin:6px 0 10px; }
  .close-tl{ font-family:'Newsreader',serif; font-size:21px; color:var(--cream); opacity:.9; }
  .close-ct{ margin-top:16px; font-size:15px; color:var(--gold-soft); letter-spacing:.03em; }

  @media (max-width:820px){
    .slide{ aspect-ratio:auto; }
    .inner{ padding:30px 24px; }
    .cover-h{ font-size:34px; } .close-h{ font-size:32px; }
    .flow{ grid-template-columns:1fr; } .farrow{ transform:rotate(90deg); justify-self:center; }
    .pillars,.plans,.steps{ grid-template-columns:1fr; }
  }

  @media print{
    @page{ size:297mm 210mm; margin:0; }
    html,body{ background:#fff; }
    .deck{ display:block; padding:0; gap:0; }
    .slide{ width:297mm; height:210mm; max-width:none; aspect-ratio:auto; border:0; border-radius:0; box-shadow:none; overflow:hidden; break-after:page; page-break-after:always; break-inside:avoid; }
    .slide:last-child{ break-after:auto; page-break-after:auto; }
    .inner{ padding:18mm 22mm; }
    .pillars{ grid-template-columns:1fr 1fr 1fr; }
    .flow{ grid-template-columns:1fr auto 1fr auto 1fr; }
    .farrow{ transform:none; }
    .plans{ grid-template-columns:${nPlanos === 1 ? '1fr' : '1fr 1fr'}; }
    .steps{ grid-template-columns:1fr 1fr; }
  }
</style>
</head>
<body>
<div class="deck">

  <!-- CAPA -->
  <section class="slide green">
    <div class="inner">
      <div class="mark">
        <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
          <circle cx="23" cy="23" r="20.5" fill="none" stroke="#F4EFE4" stroke-width="3"/>
          <text x="23" y="31" text-anchor="middle" font-family="Newsreader, serif" font-size="24" fill="#B89A5A">S</text>
        </svg>
        <span class="name">Senza Confini</span>
      </div>
      <div class="label">Proposta de parceria</div>
      <div class="cover-h display">${esc(d.titulo_servico)}</div>
      <div class="cover-sub">para a ${esc(d.empresa_cliente)}</div>
      <div class="cover-meta">Preparada para <b>${esc(d.nome_cliente)}</b> &nbsp;·&nbsp; ${esc(d.data)}</div>
    </div>
  </section>

  <!-- O MOMENTO -->
  <section class="slide">
    <div class="inner">
      <div class="label">O momento</div>
      <h2>${esc(d.momento.titulo)}</h2>
      <p class="lead">${esc(d.momento.lead)}</p>
      <p class="muted">${esc(d.momento.complemento)}</p>
    </div>
  </section>

  <!-- O QUE É -->
  <section class="slide">
    <div class="inner">
      <div class="label">Em palavras simples</div>
      <h2>${esc(d.o_que_e.titulo)}</h2>
      <p>${esc(d.o_que_e.paragrafo)}</p>
      <div class="pillars">
        ${pilares.map((p, i) => `
        <div class="pillar"><div class="k">${String(i + 1).padStart(2, '0')}</div><div class="v">${esc(p)}</div></div>`).join('')}
      </div>
    </div>
  </section>

  <!-- METODO -->
  <section class="slide">
    <div class="inner">
      <div class="label">Como trabalhamos</div>
      <h2>O nosso método: Faça, Entenda, Repita</h2>
      <p>${esc(d.metodo.intro)}</p>
      <div class="flow">
        <div class="fcard"><div class="fk">Faça</div><div class="fv">${esc(d.metodo.faca)}</div></div>
        <div class="farrow">›</div>
        <div class="fcard"><div class="fk">Entenda</div><div class="fv">${esc(d.metodo.entenda)}</div></div>
        <div class="farrow">›</div>
        <div class="fcard"><div class="fk">Repita</div><div class="fv">${esc(d.metodo.repita)}</div></div>
      </div>
    </div>
  </section>

  <!-- COMO FUNCIONA -->
  <section class="slide">
    <div class="inner">
      <div class="label">Na prática</div>
      <h2>Como funciona, passo a passo</h2>
      <div class="steps">
        ${passos.map(p => `
        <div class="step"><div class="n"></div><div class="t">${esc(p)}</div></div>`).join('')}
      </div>
    </div>
  </section>

  <!-- PLANOS -->
  <section class="slide">
    <div class="inner">
      <div class="label">Investimento</div>
      <h2>${nPlanos === 1 ? 'O seu plano' : 'Escolha o seu plano'}</h2>
      <div class="plans">
        ${planos.map(p => `
        <div class="plan${p.destaque ? ' featured' : ''}">
          ${p.destaque ? '<div class="tag">Recomendado</div>' : ''}
          <div class="pname">${esc(p.nome)}</div>
          <div class="ptag">${esc(p.subtitulo)}</div>
          <div class="price">${esc(p.preco)} <span>${esc(p.periodo)}</span></div>
          <ul>
            ${(p.itens || []).map(i => `<li>${esc(i)}</li>`).join('')}
          </ul>
          ${p.ads ? `<div class="ads">${esc(p.ads)}</div>` : ''}
        </div>`).join('')}
      </div>
      ${d.nota_planos ? `<div class="note">${esc(d.nota_planos)}</div>` : ''}
    </div>
  </section>

  <!-- FECHAMENTO -->
  <section class="slide green">
    <div class="inner">
      <div class="mark">
        <svg width="42" height="42" viewBox="0 0 46 46" aria-hidden="true">
          <circle cx="23" cy="23" r="20.5" fill="none" stroke="#F4EFE4" stroke-width="3"/>
          <text x="23" y="31" text-anchor="middle" font-family="Newsreader, serif" font-size="24" fill="#B89A5A">S</text>
        </svg>
        <span class="name">Senza Confini</span>
      </div>
      <div class="label">${esc(d.fechamento.label)}</div>
      <div class="close-h">${esc(d.fechamento.titulo)}</div>
      <div class="close-tl">${esc(d.fechamento.subtitulo)}</div>
      <div class="close-ct">${esc(d.fechamento.contato)}</div>
    </div>
  </section>

</div>
</body>
</html>`
}
