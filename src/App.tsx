import { type FormEvent, useMemo, useState } from 'react'
import './App.css'

type View = 'dashboard' | 'animals' | 'properties' | 'inventory' | 'payables' | 'receivables' | 'cash' | 'reports' | 'tasks' | 'messages' | 'content' | 'settings'
type Row = { id: string; title: string; detail: string; status: 'Ativo' | 'Pendente' | 'Pago' | 'Atrasado'; value?: string; note?: string }

const navigation: { group: string; items: [View, string, string, string?][] }[] = [
  { group: 'Visão geral', items: [['dashboard', '▦', 'Início'], ['tasks', '✓', 'Tarefas', '4'], ['messages', '✉', 'Mensagens', '3']] },
  { group: 'Operação rural', items: [['animals', '♞', 'Rebanho & Plantel'], ['properties', '⌂', 'Imóveis & Fazendas'], ['inventory', '▤', 'Estoque & Frota']] },
  { group: 'Financeiro', items: [['payables', '↓', 'Contas a pagar', '7'], ['receivables', '↑', 'Contas a receber'], ['cash', '◉', 'Caixa do dia'], ['reports', '▥', 'Relatórios']] },
  { group: 'Conteúdo e sistema', items: [['content', '◈', 'Portal & Conteúdo'], ['settings', '⚙', 'Configurações']] },
]

const metadata: Record<View, { eyebrow: string; title: string; description: string; add?: string }> = {
  dashboard: { eyebrow: 'Painel de controle', title: 'Olá, Camila.', description: 'Aqui está o panorama operacional da Alambari para hoje.' },
  animals: { eyebrow: 'Cadastros · Rebanho e plantel', title: 'Rebanho & Plantel', description: 'Bovinos, equinos, raças, genealogias e galerias.', add: 'Novo cadastro' },
  properties: { eyebrow: 'Patrimônio · Propriedades', title: 'Imóveis & Fazendas', description: 'Propriedades, documentos, fotos e imóveis associados.', add: 'Novo imóvel' },
  inventory: { eyebrow: 'Operação · Materiais e frota', title: 'Estoque & Frota', description: 'Saldos, movimentações, transferências, perdas e veículos.', add: 'Nova saída' },
  payables: { eyebrow: 'Financeiro · Despesas', title: 'Contas a pagar', description: 'Aprovação, baixa, rateios, recorrências e histórico.', add: 'Nova conta' },
  receivables: { eyebrow: 'Financeiro · Cobranças', title: 'Contas a receber', description: 'Documentos, boletos demonstrativos, baixas e refinanciamentos.', add: 'Novo documento' },
  cash: { eyebrow: 'Financeiro · Caixa', title: 'Caixa do dia', description: 'Abertura, lançamentos, transferências e fechamento.', add: 'Nova operação' },
  reports: { eyebrow: 'Análise · Resultados', title: 'Relatórios', description: 'Filtros, totais, gráficos, impressão e exportação simulada.', add: 'Gerar relatório' },
  tasks: { eyebrow: 'Colaboração · Pendências', title: 'Tarefas', description: 'Andamentos, encerramento, reabertura e transferência.', add: 'Nova tarefa' },
  messages: { eyebrow: 'Colaboração · Comunicação', title: 'Mensagens', description: 'Caixa de entrada, mensagens enviadas e composição por grupo.', add: 'Nova mensagem' },
  content: { eyebrow: 'Portal público · CMS', title: 'Portal & Conteúdo', description: 'Home, notícias, tópicos, galerias e páginas institucionais.', add: 'Novo conteúdo' },
  settings: { eyebrow: 'Administração · Sistema', title: 'Configurações', description: 'Grupos, permissões, mensagens configuráveis e boletos.', add: 'Configurar' },
}

const data: Record<View, Row[]> = {
  dashboard: [],
  animals: [
    { id: 'BOV-028', title: 'FIV Alambari Vitória', detail: 'Bovino · Nelore · Fêmea · Registro 8492', status: 'Ativo' },
    { id: 'EQU-014', title: 'Dóris FIV Alambari', detail: 'Equino · Mangalarga Marchador · Fêmea · Registro 5638', status: 'Ativo' },
    { id: 'BOV-031', title: 'Kairós TE Alambari', detail: 'Bovino · Nelore · Macho · Registro 8510', status: 'Ativo' },
    { id: 'PLA-007', title: 'Plantel Matrizes 2026', detail: 'Plantel · 22 animais vinculados', status: 'Ativo' },
  ],
  properties: [
    { id: 'IMO-004', title: 'Fazenda Alambari', detail: 'Rural · Resende/RJ · 1.245 ha', status: 'Ativo', value: 'R$ 12.800.000' },
    { id: 'IMO-012', title: 'Sítio Santa Helena', detail: 'Rural · Itatiaia/RJ · 184 ha', status: 'Ativo', value: 'R$ 3.450.000' },
    { id: 'IMO-016', title: 'Galpão Vale Verde', detail: 'Comercial · Resende/RJ', status: 'Pendente', value: 'R$ 12.000/mês' },
  ],
  inventory: [
    { id: 'EST-010', title: 'Ração confinamento', detail: 'Galpão central · Unidade: saco · Mínimo: 80', status: 'Ativo', value: '146 un.' },
    { id: 'EST-021', title: 'Suplemento mineral', detail: 'Depósito nutrição · Unidade: kg · Mínimo: 300', status: 'Pendente', value: '285 kg' },
    { id: 'FRO-003', title: 'Toyota Hilux CD 4x4', detail: 'Frota · Placa RKM-4026 · Fazenda Alambari', status: 'Ativo' },
  ],
  payables: [
    { id: 'PAG-1082', title: 'Ração e suplementos — NutriCampo', detail: 'Fazenda Alambari · Plano: Nutrição animal', status: 'Pendente', value: 'R$ 18.420,00', note: 'Vence em 2 dias' },
    { id: 'PAG-1074', title: 'Manutenção da frota — Oficina Nova', detail: 'Fazenda Alambari · Plano: Veículos', status: 'Atrasado', value: 'R$ 3.870,00', note: 'Vencido há 3 dias' },
    { id: 'PAG-1068', title: 'Energia elétrica — Fazenda', detail: 'Fazenda Alambari · Plano: Utilidades', status: 'Pago', value: 'R$ 4.985,70', note: 'Pago em 22/09' },
  ],
  receivables: [
    { id: 'REC-228', title: 'Venda de matrizes — Estância Horizonte', detail: 'Documento 01784 · Boleto registrado', status: 'Pendente', value: 'R$ 48.000,00', note: 'Vence em 5 dias' },
    { id: 'REC-226', title: 'Contrato de locação — Galpão Vale Verde', detail: 'Documento 01782 · Cliente recorrente', status: 'Pago', value: 'R$ 12.000,00', note: 'Recebido em 20/09' },
  ],
  cash: [
    { id: 'CX-090', title: 'Caixa de 25/09/2026', detail: 'Aberto às 08:04 por Camila Martins · 14 operações', status: 'Ativo', value: 'Saldo R$ 86.540,62' },
    { id: 'OP-804', title: 'Entrada — Recebimento de documento', detail: 'Conta Itaú 4077 · Documento REC-226', status: 'Pago', value: '+ R$ 12.000,00' },
    { id: 'OP-805', title: 'Saída — NutriCampo', detail: 'Conta Itaú 4077 · Conta PAG-1068', status: 'Pago', value: '− R$ 4.985,70' },
  ],
  reports: [
    { id: 'REL-01', title: 'Fluxo de caixa projetado', detail: 'Entradas, saídas e saldo acumulado por período', status: 'Ativo' },
    { id: 'REL-02', title: 'Saldo projetado', detail: 'Comparativo mensal de receitas e despesas', status: 'Ativo' },
    { id: 'REL-03', title: 'Relatório de estoque', detail: 'Posição por material e galpão', status: 'Ativo' },
  ],
  tasks: [
    { id: 'TSK-104', title: 'Revisar documentação da Fazenda Alambari', detail: 'Executor: Mariana Lopes · Operador: Camila Martins', status: 'Pendente', note: 'Prazo: hoje, 17:30' },
    { id: 'TSK-101', title: 'Validar rateio de despesas da frota', detail: 'Executor: Pedro Silva · Andamento registrado ontem', status: 'Atrasado', note: 'Prazo: 22/09' },
    { id: 'TSK-099', title: 'Atualizar fotos do plantel', detail: 'Executor: João Batista · 6 imagens anexadas', status: 'Ativo', note: 'Prazo: 28/09' },
  ],
  messages: [
    { id: 'MSG-591', title: 'Nova tarefa: revisar documentação', detail: 'De Camila Martins · Hoje, 09:24', status: 'Pendente' },
    { id: 'MSG-588', title: 'Andamento registrado em TSK-101', detail: 'De Pedro Silva · Ontem, 16:51', status: 'Ativo' },
    { id: 'MSG-585', title: 'Aprovação necessária para PAG-1082', detail: 'De Financeiro · Ontem, 10:12', status: 'Pendente' },
  ],
  content: [
    { id: 'CON-01', title: 'Carrossel da Home', detail: '3 slides ativos · Última alteração hoje', status: 'Ativo' },
    { id: 'CON-02', title: 'Notícias', detail: '12 publicadas · 2 rascunhos', status: 'Ativo' },
    { id: 'CON-03', title: 'Álbuns de fotos e vídeos', detail: '8 álbuns · 54 mídias', status: 'Ativo' },
  ],
  settings: [
    { id: 'CFG-01', title: 'Grupos e permissões', detail: 'Administrar acessos por módulo e perfil', status: 'Ativo' },
    { id: 'CFG-02', title: 'Configurações do sistema', detail: 'Nome, manutenção e níveis de acesso', status: 'Ativo' },
    { id: 'CFG-03', title: 'Modelos de boleto', detail: 'Configurações e prévias demonstrativas', status: 'Ativo' },
  ],
}

function Status({ value }: { value: Row['status'] }) {
  const css = value === 'Ativo' || value === 'Pago' ? 'ok' : value === 'Atrasado' ? 'danger' : 'waiting'
  return <span className={'status ' + css}><i />{value}</span>
}

function App() {
  const [view, setView] = useState<View>('dashboard')
  const [publicMode, setPublicMode] = useState(false)
  const [query, setQuery] = useState('')
  const [drawer, setDrawer] = useState<Row | null>(null)
  const [modal, setModal] = useState(false)
  const [toast, setToast] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const notice = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  const go = (target: View) => { setView(target); setQuery(''); setDrawer(null); setMenuOpen(false) }
  const filtered = useMemo(() => data[view].filter(item => (item.title + item.detail + item.id).toLowerCase().includes(query.toLowerCase())), [view, query])
  if (publicMode) return <PublicSite back={() => setPublicMode(false)} />
  const meta = metadata[view]
  return <div className="app">
    <aside className={'sidebar ' + (menuOpen ? 'open' : '')}>
      <div className="brand"><div className="brand-symbol">A</div><div><strong>Alambari</strong><span>Gestão Agropecuária</span></div><button className="close-menu" onClick={() => setMenuOpen(false)}>×</button></div>
      <nav>{navigation.map(section => <section className="nav-group" key={section.group}><p>{section.group}</p>{section.items.map(([id, icon, label, badge]) => <button key={id} className={view === id ? 'nav active' : 'nav'} onClick={() => go(id)}><i>{icon}</i><span>{label}</span>{badge && <b>{badge}</b>}</button>)}</section>)}</nav>
      <footer><i />Sistema demonstrativo<small>Dados simulados · React + TypeScript</small></footer>
    </aside>
    {menuOpen && <div className="shade" onClick={() => setMenuOpen(false)} />}
    <main>
      <header className="topbar"><button className="hamburger" onClick={() => setMenuOpen(true)}>☰</button><span>Alambari <b>/</b> {meta.title}</span><div><button className="portal-button" onClick={() => setPublicMode(true)}>◈ Ver portal público</button><button className="mail" onClick={() => go('messages')}>✉<b>3</b></button><button className="avatar" onClick={() => go('settings')}>CM</button></div></header>
      <div className="page">
        {view === 'dashboard' ? <Dashboard go={go} notice={notice} /> : <Module meta={meta} view={view} rows={filtered} query={query} setQuery={setQuery} open={setDrawer} create={() => setModal(true)} notice={notice} />}
      </div>
    </main>
    {drawer && <Drawer row={drawer} view={view} close={() => setDrawer(null)} notice={notice} />}
    {modal && <NewModal title={meta.add || 'Novo registro'} close={() => setModal(false)} notice={notice} />}
    {toast && <div className="toast">✓ {toast}</div>}
  </div>
}

function Dashboard({ go, notice }: { go: (view: View) => void; notice: (message: string) => void }) {
  return <>
    <section className="hero"><div><p>PAINEL DE CONTROLE</p><h1>Olá, Camila.</h1><span>Veja o que requer sua atenção na operação da Alambari.</span><button onClick={() => go('tasks')}>Ver minhas tarefas <b>→</b></button></div><section><article><b>R$ 86.540</b><span>Saldo de caixa</span><em>↑ 8,4% este mês</em></article><article><b>7</b><span>Aprovações pendentes</span><em className="gold">2 vencem hoje</em></article></section></section>
    <section className="metrics"><Metric icon="↓" name="A pagar" value="R$ 22.290" note="2 vencidas" color="red" go={() => go('payables')} /><Metric icon="↑" name="A receber" value="R$ 60.000" note="Próximos 7 dias" color="green" go={() => go('receivables')} /><Metric icon="♞" name="Rebanho" value="184" note="Animais ativos" color="gold" go={() => go('animals')} /><Metric icon="✓" name="Tarefas" value="4" note="2 exigem atenção" color="blue" go={() => go('tasks')} /></section>
    <section className="grid"><article className="card chart-card"><CardTitle title="Fluxo de caixa projetado" detail="Setembro · valores em R$" action="Ver relatório" click={() => go('reports')} /><div className="chart"><aside><span>100k</span><span>75k</span><span>50k</span><span>25k</span><span>0</span></aside><svg viewBox="0 0 600 210" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#82c39e" stopOpacity=".35"/><stop offset="1" stopColor="#82c39e" stopOpacity="0"/></linearGradient></defs><path d="M0 167 C38 148 58 157 93 130 S154 139 187 107 S247 118 280 84 S343 95 374 65 S433 72 466 49 S535 68 600 19 L600 210 L0 210Z" fill="url(#area)"/><path d="M0 167 C38 148 58 157 93 130 S154 139 187 107 S247 118 280 84 S343 95 374 65 S433 72 466 49 S535 68 600 19" fill="none" stroke="#33825b" strokeWidth="3"/></svg><footer><span>01 set</span><span>08 set</span><span>15 set</span><span>22 set</span><span>29 set</span></footer></div></article>
      <article className="card"><CardTitle title="Prioridades de hoje" detail="2 itens exigem atenção" action="Todas" click={() => go('tasks')} /><Priority color="red" title="Revisar documentação da Fazenda Alambari" text="Hoje, 17:30 · Mariana Lopes" click={() => go('tasks')} /><Priority color="gold" title="Aprovar pagamento da NutriCampo" text="Vence em 2 dias · R$ 18.420,00" click={() => go('payables')} /><Priority color="green" title="Atualizar fotos do plantel" text="28 set · João Batista" click={() => notice('Andamento da tarefa aberto.')} /></article></section>
    <section className="grid bottom"><article className="card"><CardTitle title="Atividade recente" detail="Últimas movimentações" /><Timeline /></article><article className="card"><CardTitle title="Ações rápidas" detail="Atalhos do sistema" /><div className="quick"><button onClick={() => go('payables')}>＋<span>Nova conta</span></button><button onClick={() => go('animals')}>♞<span>Novo animal</span></button><button onClick={() => go('messages')}>✉<span>Mensagem</span></button><button onClick={() => go('reports')}>▥<span>Relatório</span></button></div></article></section>
  </>
}
function Metric({ icon, name, value, note, color, go }: { icon: string; name: string; value: string; note: string; color: string; go: () => void }) { return <button className="metric" onClick={go}><i className={color}>{icon}</i><span>{name}</span><b>{value}</b><small>{note} <em>→</em></small></button> }
function CardTitle({ title, detail, action, click }: { title: string; detail: string; action?: string; click?: () => void }) { return <header className="card-title"><div><h2>{title}</h2><p>{detail}</p></div>{action && <button onClick={click}>{action} →</button>}</header> }
function Priority({ color, title, text, click }: { color: string; title: string; text: string; click: () => void }) { return <button className="priority" onClick={click}><i className={color} /><span><b>{title}</b><small>{text}</small></span><strong>→</strong></button> }
function Timeline() { return <div className="timeline"><div><i className="green">↑</i><p><b>Documento REC-226 recebido</b><span>R$ 12.000,00 entrou no Caixa do dia · há 45 min</span></p></div><div><i className="blue">✓</i><p><b>Tarefa atualizada por Pedro Silva</b><span>“Rateio de frota em conferência” · há 2 h</span></p></div><div><i className="gold">♞</i><p><b>Foto adicionada a Dóris FIV Alambari</b><span>Álbum do animal atualizado · ontem</span></p></div></div> }

function Module({ meta, view, rows, query, setQuery, open, create, notice }: { meta: { eyebrow: string; title: string; description: string; add?: string }; view: View; rows: Row[]; query: string; setQuery: (v: string) => void; open: (row: Row) => void; create: () => void; notice: (message: string) => void }) {
  return <><section className="module-title"><div><p>{meta.eyebrow}</p><h1>{meta.title}</h1><span>{meta.description}</span></div>{meta.add && <button onClick={create}>＋ {meta.add}</button>}</section>{view === 'reports' && <Report notice={notice} />}<section className="table"><header><label>⌕<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Pesquisar por qualquer campo..." /></label><button onClick={() => notice('Filtros avançados disponíveis no protótipo.')}>☷ Filtros</button><button onClick={() => notice('Lista atualizada.')}>↻</button></header><div className="labels"><span>{view === 'tasks' ? 'Tarefa' : view === 'messages' ? 'Assunto' : 'Registro'}</span><span>Informações</span><span>Status</span><span>Valor / Ações</span></div>{rows.map(row => <button className="table-row" key={row.id} onClick={() => open(row)}><span className="row-name"><b>{row.title}</b><small>{row.id}</small></span><span className="row-info">{row.detail}<small>{row.note}</small></span><Status value={row.status} /><span className="row-value">{row.value || 'Ver detalhes →'}</span></button>)}{!rows.length && <p className="empty">Nenhum registro encontrado para esta busca.</p>}<footer><span>Mostrando {rows.length} registros demonstrativos</span><div>‹ <b>1</b> ›</div></footer></section></>
}
function Report({ notice }: { notice: (message: string) => void }) { return <section className="report"><header><div><i>▥</i><span><b>Saldo projetado · Setembro 2026</b><small>Receitas, despesas e saldo acumulado</small></span></div><aside><button onClick={() => notice('Prévia de impressão aberta.')}>⎙ Imprimir</button><button onClick={() => notice('Arquivo CSV demonstrativo exportado.')}>⇩ Exportar</button></aside></header><footer><div><span>Entradas previstas</span><b>R$ 184.500</b></div><div><span>Saídas previstas</span><b>R$ 122.860</b></div><div><span>Saldo projetado</span><b className="positive">R$ 61.640</b></div></footer></section> }

function Drawer({ row, view, close, notice }: { row: Row; view: View; close: () => void; notice: (message: string) => void }) { const task = view === 'tasks'; return <div className="drawer-wrap"><div onClick={close} /><aside className="drawer"><header><span><small>{row.id}</small><h2>{row.title}</h2></span><button onClick={close}>×</button></header><main><Status value={row.status} /><p>{row.detail}</p>{row.value && <strong className="drawer-value">{row.value}<small>{row.note}</small></strong>}<section><h3>{task ? 'Andamentos' : 'Informações do registro'}</h3>{task ? <><article><b>Pedro Silva</b><span>Rateio de frota está em conferência com as fazendas.</span><small>Ontem, 16:51</small></article><article><b>Camila Martins</b><span>Tarefa criada e atribuída ao responsável.</span><small>20 set, 09:10</small></article></> : <dl><div><dt>Responsável</dt><dd>Camila Martins</dd></div><div><dt>Atualização</dt><dd>Hoje, 10:32</dd></div><div><dt>Origem</dt><dd>Dados demonstrativos</dd></div></dl>}</section></main><footer>{task ? <><button onClick={() => notice('Andamento inserido com sucesso.')}>Inserir andamento</button><button className="confirm" onClick={() => notice('Tarefa encerrada e aguardando ciente do operador.')}>Encerrar tarefa</button></> : <><button onClick={() => notice('Edição demonstrativa aberta.')}>Editar</button><button className="confirm" onClick={() => notice('Ação registrada com sucesso.')}>Confirmar ação</button></>}</footer></aside></div> }
function NewModal({ title, close, notice }: { title: string; close: () => void; notice: (message: string) => void }) { const submit = (e: FormEvent) => { e.preventDefault(); close(); notice(title + ' salvo com sucesso.') }; return <div className="modal-wrap"><div onClick={close} /><form onSubmit={submit}><header><span><small>NOVO REGISTRO</small><h2>{title}</h2></span><button type="button" onClick={close}>×</button></header><main><label>Descrição<input autoFocus required placeholder="Informe uma descrição" /></label><label>Categoria<select><option>Selecione uma opção</option><option>Fazenda Alambari</option><option>Administrativo</option></select></label><label>Data<input type="date" defaultValue="2026-09-25" /></label><label>Valor<input placeholder="R$ 0,00" /></label><label className="wide">Observações<textarea placeholder="Inclua informações relevantes" /></label></main><footer><button type="button" onClick={close}>Cancelar</button><button className="confirm">Salvar registro</button></footer></form></div> }

function PublicSite({ back }: { back: () => void }) {
  const [page, setPage] = useState('home'); const [sent, setSent] = useState(false)
  const menu = [['home', 'Início'], ['institucional', 'Institucional'], ['mangalarga', 'Mangalarga Marchador'], ['corte', 'Pecuária de Corte'], ['leite', 'Pecuária de Leite'], ['midia', 'Fotos e Vídeos'], ['noticias', 'Notícias'], ['contato', 'Fale Conosco']]
  const names: Record<string, string> = { home: 'Agropecuária Alambari', institucional: 'Nossa história', mangalarga: 'Mangalarga Marchador', corte: 'Pecuária de Corte', leite: 'Pecuária de Leite', midia: 'Fotos e Vídeos', noticias: 'Notícias', contato: 'Fale Conosco' }
  return <div className="public"><header><button onClick={back}>← Painel administrativo</button><span>Resende · Rio de Janeiro</span></header><div className="public-layout"><aside><div className="public-logo"><i>A</i><span><b>Alambari</b><small>Agropecuária</small></span></div><label className="public-search"><input placeholder="Buscar no site" /><button>⌕</button></label><nav>{menu.map(([id, label]) => <button key={id} className={page === id ? 'selected' : ''} onClick={() => setPage(id)}>{label}<span>→</span></button>)}</nav><section className="latest"><p>ÚLTIMAS NOTÍCIAS</p><button onClick={() => setPage('noticias')}>Alambari participa de encontro nacional<small>12 SET 2026</small></button><button onClick={() => setPage('noticias')}>Nova safra, novos resultados<small>02 SET 2026</small></button></section></aside><main><div className="public-top"><span>Excelência que vem da terra</span><b>f　in　◎</b></div><p className="crumb">HOME / {names[page].toUpperCase()}</p>{page === 'home' ? <><section className="site-hero"><div><small>TRADIÇÃO E INOVAÇÃO</small><h1>Há gerações, cultivando excelência.</h1><p>Genética, cuidado e respeito pela terra em cada resultado.</p><button onClick={() => setPage('institucional')}>Conheça a Alambari →</button></div></section><section className="intro"><small>DESDE 1978</small><h2>Uma história de dedicação ao campo.</h2><p>A Alambari reúne tradição agropecuária, manejo responsável e um olhar atento para o futuro. Este protótipo recria a experiência de navegação do portal institucional legado.</p><div><button onClick={() => setPage('mangalarga')}>♞<b>Mangalarga Marchador</b><span>Conheça nosso plantel →</span></button><button onClick={() => setPage('corte')}>◉<b>Pecuária de corte</b><span>Qualidade genética →</span></button><button onClick={() => setPage('leite')}>◌<b>Pecuária de leite</b><span>Produtividade e cuidado →</span></button></div></section></> : page === 'contato' ? <section className="contact"><small>FALE CONOSCO</small><h1>Como podemos ajudar?</h1><p>Envie sua mensagem. Neste protótipo, o envio é apenas simulado.</p>{sent ? <div className="sent">✓ Mensagem enviada com sucesso.<button onClick={() => setSent(false)}>Enviar outra mensagem</button></div> : <form onSubmit={e => { e.preventDefault(); setSent(true) }}><label>Nome<input required placeholder="Seu nome" /></label><label>E-mail<input required type="email" placeholder="voce@email.com" /></label><label>Assunto<input required placeholder="Como podemos ajudar?" /></label><label>Mensagem<textarea required placeholder="Escreva sua mensagem" /></label><button>Enviar mensagem →</button></form>}</section> : <section className="site-page"><small>{page === 'noticias' ? 'ATUALIDADES' : 'ALAMBARI AGROPECUÁRIA'}</small><h1>{names[page]}</h1><p>Esta tela demonstra a página pública correspondente ao sistema legado, modernizada para uma experiência responsiva. O conteúdo é ilustrativo e os dados são simulados.</p>{['mangalarga', 'corte', 'leite'].includes(page) && <article className="animal"><i>♞</i><span><h2>Genética que atravessa gerações</h2><p>Conheça nossos animais, suas genealogias, registros, fotos e informações de plantel.</p><button onClick={() => setPage('midia')}>Ver galeria →</button></span></article>}{page === 'noticias' && <div className="news">{['Alambari participa de encontro nacional de criadores', 'Nova safra, novos resultados para o rebanho', 'Manejo e bem-estar animal em foco'].map((title, i) => <article key={title}><small>{12 - i * 5} SET 2026</small><h2>{title}</h2><p>Confira os destaques e as novidades da Agropecuária Alambari.</p><button>Leia mais →</button></article>)}</div>}</section>}<footer>Rua Gastão Vieira de Araújo, s/n · Engenheiro Passos · Resende/RJ <span>© Alambari Agropecuária</span></footer></main></div></div>
}

export default App
