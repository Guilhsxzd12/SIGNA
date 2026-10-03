"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, Boxes, BriefcaseBusiness, Calculator, ChevronRight, CircleDollarSign,
  ClipboardList, CreditCard, FileText, LayoutDashboard, PackagePlus, Plus,
  ReceiptText, Search, Settings as SettingsIcon, ShoppingCart, Trash2, UsersRound,
  WalletCards, Wrench, X
} from "lucide-react";
import { contribution, priceForPayment } from "@/lib/pricing";
import { initialData, loadData, saveData, SignaData } from "@/lib/storage";
import { Client, Expense, PaymentMethod, Product, Sale, ServiceOrder } from "@/lib/types";

type Page = "dashboard" | "pdv" | "quotes" | "products" | "clients" | "finance" | "services" | "reports" | "settings";

const money = (v:number) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v || 0);
const nowCode = (prefix:string) => prefix + "-" + Date.now().toString().slice(-7);
const uid = () => crypto.randomUUID();

const nav = [
  {id:"dashboard",label:"Visão geral",icon:LayoutDashboard},
  {id:"pdv",label:"PDV / Vendas",icon:ShoppingCart},
  {id:"quotes",label:"Orçamentos",icon:ClipboardList},
  {id:"products",label:"Produtos",icon:Boxes},
  {id:"clients",label:"Clientes",icon:UsersRound},
  {id:"finance",label:"Financeiro",icon:WalletCards},
  {id:"services",label:"Ordens de serviço",icon:Wrench},
  {id:"reports",label:"Relatórios",icon:BarChart3},
  {id:"settings",label:"Configurações",icon:SettingsIcon},
] as const;

function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}) {
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className="modal" onMouseDown={e=>e.stopPropagation()}>
      <div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>
      {children}
    </div>
  </div>
}

function Field({label,wide,children}:{label:string;wide?:boolean;children:React.ReactNode}){
  return <label className={wide?"field wide":"field"}><span>{label}</span>{children}</label>
}
function Empty({text}:{text:string}){return <div className="empty"><FileText size={28}/><span>{text}</span></div>}
function Kpi({icon:Icon,label,value,hint}:{icon:any;label:string;value:string;hint:string}){
  return <div className="kpi"><div className="kpi-icon"><Icon size={21}/></div><div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div></div>
}

export default function SignaApp(){
  const [page,setPage] = useState<Page>("dashboard");
  const [data,setData] = useState<SignaData>(initialData);
  const [ready,setReady] = useState(false);

  useEffect(()=>{setData(loadData());setReady(true)},[]);
  useEffect(()=>{if(ready) saveData(data)},[data,ready]);

  const sales = data.sales.filter(s=>s.type==="sale" && s.status!=="cancelled");
  const paidSales = sales.filter(s=>s.status==="paid");
  const revenue = paidSales.reduce((a,s)=>a+s.total,0);
  const cost = paidSales.reduce((a,s)=>a+s.items.reduce((x,i)=>x+i.unitCost*i.qty,0),0);
  const pendingExpenses = data.expenses.filter(e=>e.status==="pending").reduce((a,e)=>a+e.value,0);
  const lowStock = data.products.filter(p=>p.active && p.stock<=p.minStock);

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">S</div>
        <div><strong>SIGNA</strong><span>Gestão empresarial</span></div>
      </div>
      <nav>
        {nav.map(item=>{
          const Icon=item.icon;
          return <button key={item.id} className={page===item.id?"nav-item active":"nav-item"} onClick={()=>setPage(item.id as Page)}>
            <Icon size={18}/><span>{item.label}</span><ChevronRight size={15} className="nav-arrow"/>
          </button>
        })}
      </nav>
      <div className="sidebar-foot">
        <div className="company-chip"><BriefcaseBusiness size={17}/><div><b>{data.settings.companyName}</b><span>Ambiente local</span></div></div>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div><span className="eyebrow">SIGNA Gestão</span><h1>{nav.find(n=>n.id===page)?.label}</h1></div>
        <div className="top-actions">
          <button className="ghost" onClick={()=>setPage("products")}><PackagePlus size={17}/> Novo produto</button>
          <button className="primary" onClick={()=>setPage("pdv")}><ShoppingCart size={17}/> Nova venda</button>
        </div>
      </header>

      <section className="content">
        {page==="dashboard" && <Dashboard data={data} revenue={revenue} cost={cost} pendingExpenses={pendingExpenses} lowStock={lowStock}/>}
        {page==="pdv" && <PDV data={data} setData={setData}/>}
        {page==="quotes" && <Quotes data={data} setData={setData}/>}
        {page==="products" && <Products data={data} setData={setData}/>}
        {page==="clients" && <Clients data={data} setData={setData}/>}
        {page==="finance" && <Finance data={data} setData={setData}/>}
        {page==="services" && <Services data={data} setData={setData}/>}
        {page==="reports" && <Reports data={data}/>}
        {page==="settings" && <SettingsPage data={data} setData={setData}/>}
      </section>
    </main>
  </div>
}

function Dashboard({data,revenue,cost,pendingExpenses,lowStock}:{data:SignaData;revenue:number;cost:number;pendingExpenses:number;lowStock:Product[]}){
  const profit=revenue-cost;
  const salesToday=data.sales.filter(s=>new Date(s.createdAt).toDateString()===new Date().toDateString() && s.type==="sale" && s.status!=="cancelled");
  const marginText = revenue ? ((profit/revenue)*100).toFixed(1) + "% do faturamento" : "Sem vendas ainda";
  return <>
    <div className="kpis">
      <Kpi icon={CircleDollarSign} label="Faturamento" value={money(revenue)} hint="Vendas pagas"/>
      <Kpi icon={Calculator} label="Lucro bruto estimado" value={money(profit)} hint={marginText}/>
      <Kpi icon={ReceiptText} label="Contas a pagar" value={money(pendingExpenses)} hint="Pendências financeiras"/>
      <Kpi icon={ShoppingCart} label="Vendas hoje" value={String(salesToday.length)} hint={money(salesToday.reduce((a,s)=>a+s.total,0))}/>
    </div>
    <div className="grid-2">
      <div className="card">
        <div className="card-title"><div><h2>Operação rápida</h2><p>Acesso direto às rotinas do dia a dia.</p></div></div>
        <div className="quick-grid">
          <Quick icon={ShoppingCart} title="PDV" text="Venda rápida"/>
          <Quick icon={ClipboardList} title="Orçamentos" text="Propostas"/>
          <Quick icon={Boxes} title="Produtos" text="Estoque e preço"/>
          <Quick icon={UsersRound} title="Clientes" text="Cadastro"/>
          <Quick icon={WalletCards} title="Financeiro" text="Pagar e receber"/>
          <Quick icon={BarChart3} title="Relatórios" text="Indicadores"/>
        </div>
      </div>
      <div className="card">
        <div className="card-title"><div><h2>Atenção ao estoque</h2><p>Produtos abaixo ou no estoque mínimo.</p></div><span className="pill warn">{lowStock.length} itens</span></div>
        <div className="mini-list">
          {lowStock.length===0?<Empty text="Nenhum produto com estoque baixo."/>:lowStock.slice(0,6).map(p=><div className="mini-row" key={p.id}><div><b>{p.name}</b><span>{p.sku}</span></div><strong>{p.stock} {p.unit}</strong></div>)}
        </div>
      </div>
    </div>
    <div className="card">
      <div className="card-title"><div><h2>Últimas movimentações</h2><p>Vendas e orçamentos recentes.</p></div></div>
      <div className="table-wrap"><table><thead><tr><th>Documento</th><th>Tipo</th><th>Cliente</th><th>Data</th><th>Status</th><th className="right">Valor</th></tr></thead>
      <tbody>{data.sales.slice(0,7).map(s=><tr key={s.id}><td><b>{s.code}</b></td><td>{s.type==="sale"?"Venda":"Orçamento"}</td><td>{s.clientName||"Consumidor final"}</td><td>{new Date(s.createdAt).toLocaleString("pt-BR")}</td><td><span className="pill">{s.status}</span></td><td className="right"><b>{money(s.total)}</b></td></tr>)}</tbody></table></div>
      {data.sales.length===0&&<Empty text="Nenhuma movimentação registrada ainda."/>}
    </div>
  </>
}

function Quick({icon:Icon,title,text}:{icon:any;title:string;text:string}){
  return <div className="quick-item"><div className="quick-icon"><Icon size={21}/></div><div><b>{title}</b><span>{text}</span></div></div>
}

function Products({data,setData}:{data:SignaData;setData:React.Dispatch<React.SetStateAction<SignaData>>}){
  const [search,setSearch]=useState("");
  const [open,setOpen]=useState(false);
  const [edit,setEdit]=useState<Product|null>(null);
  const filtered=data.products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())||p.sku.toLowerCase().includes(search.toLowerCase()));
  const save=(p:Product)=>{
    setData(d=>({...d,products:edit?d.products.map(x=>x.id===p.id?p:x):[p,...d.products]}));
    setOpen(false);setEdit(null);
  };
  return <div className="card">
    <div className="card-title"><div><h2>Cadastro de produtos</h2><p>Custos, estoque, margem e preços calculados automaticamente.</p></div><button className="primary" onClick={()=>{setEdit(null);setOpen(true)}}><Plus size={17}/> Cadastrar produto</button></div>
    <div className="toolbar"><div className="search"><Search size={17}/><input placeholder="Pesquisar por nome ou código..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div>
    <div className="table-wrap"><table><thead><tr><th>Código</th><th>Descrição</th><th>Estoque</th><th>Custo</th><th>Margem</th><th>Pix</th><th>Cartão 1x</th><th></th></tr></thead>
      <tbody>{filtered.map(p=><tr key={p.id}><td>{p.sku}</td><td><b>{p.name}</b><small className="block">{p.category||"Sem categoria"}</small></td><td>{p.stock} {p.unit}</td><td>{money(p.cost)}</td><td>{p.margin??data.settings.defaultMargin}%</td><td><b>{money(priceForPayment(p,data.settings,"pix"))}</b></td><td>{money(priceForPayment(p,data.settings,"card1"))}</td><td className="right"><button className="link-btn" onClick={()=>{setEdit(p);setOpen(true)}}>Editar</button></td></tr>)}</tbody>
    </table></div>
    {filtered.length===0&&<Empty text="Nenhum produto cadastrado."/>}
    {open&&<ProductModal product={edit} data={data} onClose={()=>{setOpen(false);setEdit(null)}} onSave={save}/>}
  </div>
}

function ProductModal({product,data,onClose,onSave}:{product:Product|null;data:SignaData;onClose:()=>void;onSave:(p:Product)=>void}){
  const [f,setF]=useState<Product>(product??{id:uid(),sku:"",name:"",category:"",unit:"UN",cost:0,stock:0,minStock:0,active:true});
  const set=(k:keyof Product,v:any)=>setF(x=>({...x,[k]:v}));
  return <Modal title={product?"Editar produto":"Novo produto"} onClose={onClose}>
    <div className="form-grid">
      <Field label="Código / SKU"><input value={f.sku} onChange={e=>set("sku",e.target.value)}/></Field>
      <Field label="Unidade"><input value={f.unit} onChange={e=>set("unit",e.target.value)}/></Field>
      <Field wide label="Descrição"><input value={f.name} onChange={e=>set("name",e.target.value)}/></Field>
      <Field wide label="Categoria"><input value={f.category} onChange={e=>set("category",e.target.value)}/></Field>
      <Field label="Custo de compra"><input type="number" step="0.01" value={f.cost} onChange={e=>set("cost",+e.target.value)}/></Field>
      <Field label="Margem personalizada (%)"><input type="number" placeholder={String(data.settings.defaultMargin)} value={f.margin??""} onChange={e=>set("margin",e.target.value===""?undefined:+e.target.value)}/></Field>
      <Field label="Custo embalagem"><input type="number" step="0.01" placeholder={String(data.settings.defaultPackagingCost)} value={f.packagingCost??""} onChange={e=>set("packagingCost",e.target.value===""?undefined:+e.target.value)}/></Field>
      <Field label="Outros custos"><input type="number" step="0.01" placeholder={String(data.settings.defaultExtraCost)} value={f.extraCost??""} onChange={e=>set("extraCost",e.target.value===""?undefined:+e.target.value)}/></Field>
      <Field label="Estoque atual"><input type="number" value={f.stock} onChange={e=>set("stock",+e.target.value)}/></Field>
      <Field label="Estoque mínimo"><input type="number" value={f.minStock} onChange={e=>set("minStock",+e.target.value)}/></Field>
    </div>
    <div className="price-preview">
      <div><span>Pix</span><b>{money(priceForPayment(f,data.settings,"pix"))}</b></div>
      <div><span>Cartão 1x</span><b>{money(priceForPayment(f,data.settings,"card1"))}</b></div>
      <div><span>Cartão 2x</span><b>{money(priceForPayment(f,data.settings,"card2"))}</b></div>
      <div><span>Lucro unit. Pix</span><b>{money(contribution(f,data.settings,"pix"))}</b></div>
    </div>
    <div className="modal-actions"><button className="ghost" onClick={onClose}>Cancelar</button><button className="primary" disabled={!f.name||!f.sku} onClick={()=>onSave(f)}>Salvar produto</button></div>
  </Modal>
}

function PDV({data,setData}:{data:SignaData;setData:React.Dispatch<React.SetStateAction<SignaData>>}){
  const [q,setQ]=useState("");
  const [cart,setCart]=useState<{product:Product;qty:number}[]>([]);
  const [payment,setPayment]=useState<PaymentMethod>("pix");
  const [clientId,setClientId]=useState("");
  const [discount,setDiscount]=useState(0);
  const products=data.products.filter(p=>p.active && (p.name.toLowerCase().includes(q.toLowerCase())||p.sku.toLowerCase().includes(q.toLowerCase()))).slice(0,8);
  const add=(p:Product)=>setCart(c=>c.some(i=>i.product.id===p.id)?c.map(i=>i.product.id===p.id?{...i,qty:i.qty+1}:i):[...c,{product:p,qty:1}]);
  const subtotal=cart.reduce((a,i)=>a+priceForPayment(i.product,data.settings,payment)*i.qty,0);
  const total=Math.max(0,subtotal-discount);
  const finalize=(type:"sale"|"quote")=>{
    if(!cart.length)return;
    const client=data.clients.find(c=>c.id===clientId);
    const sale:Sale={id:uid(),code:nowCode(type==="sale"?"V":"ORC"),createdAt:new Date().toISOString(),clientId:client?.id,clientName:client?.name,payment,
      items:cart.map(i=>({productId:i.product.id,name:i.product.name,qty:i.qty,unitPrice:priceForPayment(i.product,data.settings,payment),unitCost:i.product.cost})),
      subtotal,discount,total,status:type==="sale"?"paid":"pending",type};
    setData(d=>({...d,sales:[sale,...d.sales],products:type==="sale"?d.products.map(p=>{const ci=cart.find(i=>i.product.id===p.id);return ci?{...p,stock:Math.max(0,p.stock-ci.qty)}:p}):d.products}));
    setCart([]);setDiscount(0);
  };
  return <div className="pdv-grid">
    <div className="card">
      <div className="card-title"><div><h2>Venda rápida</h2><p>Busque o produto e adicione ao carrinho.</p></div></div>
      <div className="search big"><Search size={19}/><input autoFocus placeholder="Digite produto ou código..." value={q} onChange={e=>setQ(e.target.value)}/></div>
      <div className="product-pick-grid">{products.map(p=><button className="pick-card" key={p.id} onClick={()=>add(p)}><div><b>{p.name}</b><span>{p.sku} · Estoque {p.stock}</span></div><strong>{money(priceForPayment(p,data.settings,payment))}</strong><Plus size={18}/></button>)}</div>
      {data.products.length===0&&<Empty text="Cadastre produtos para começar a vender."/>}
    </div>
    <div className="card cart-card">
      <div className="card-title"><div><h2>Resumo da venda</h2><p>{cart.length} item(ns)</p></div></div>
      <div className="cart-lines">
        {cart.map(i=><div className="cart-line" key={i.product.id}><div><b>{i.product.name}</b><span>{money(priceForPayment(i.product,data.settings,payment))} × {i.qty}</span></div><div className="qty"><button onClick={()=>setCart(c=>c.map(x=>x.product.id===i.product.id?{...x,qty:Math.max(1,x.qty-1)}:x))}>−</button><b>{i.qty}</b><button onClick={()=>setCart(c=>c.map(x=>x.product.id===i.product.id?{...x,qty:x.qty+1}:x))}>+</button><button className="trash" onClick={()=>setCart(c=>c.filter(x=>x.product.id!==i.product.id))}><Trash2 size={15}/></button></div></div>)}
        {!cart.length&&<Empty text="Carrinho vazio."/>}
      </div>
      <div className="form-stack">
        <Field label="Cliente"><select value={clientId} onChange={e=>setClientId(e.target.value)}><option value="">Consumidor final</option>{data.clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Forma de pagamento"><select value={payment} onChange={e=>setPayment(e.target.value as PaymentMethod)}><option value="pix">Pix</option><option value="cash">Dinheiro</option><option value="card1">Cartão 1x</option><option value="card2">Cartão 2x</option><option value="card3">Cartão 3x</option><option value="card4">Cartão 4x</option></select></Field>
        <Field label="Desconto"><input type="number" step="0.01" value={discount} onChange={e=>setDiscount(+e.target.value)}/></Field>
      </div>
      <div className="totals"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Desconto</span><b>- {money(discount)}</b></div><div className="grand"><span>Total</span><strong>{money(total)}</strong></div></div>
      <div className="split-actions"><button className="ghost" disabled={!cart.length} onClick={()=>finalize("quote")}><ClipboardList size={17}/> Salvar orçamento</button><button className="primary" disabled={!cart.length} onClick={()=>finalize("sale")}><CreditCard size={17}/> Finalizar venda</button></div>
    </div>
  </div>
}

function Quotes({data,setData}:{data:SignaData;setData:React.Dispatch<React.SetStateAction<SignaData>>}){
  const quotes=data.sales.filter(s=>s.type==="quote");
  const convert=(q:Sale)=>setData(d=>({...d,sales:d.sales.map(s=>s.id===q.id?{...s,type:"sale",status:"paid",code:nowCode("V")}:s),products:d.products.map(p=>{const it=q.items.find(i=>i.productId===p.id);return it?{...p,stock:Math.max(0,p.stock-it.qty)}:p})}));
  return <div className="card"><div className="card-title"><div><h2>Orçamentos</h2><p>Propostas criadas no PDV e prontas para converter em venda.</p></div></div>
    <div className="table-wrap"><table><thead><tr><th>Número</th><th>Cliente</th><th>Data</th><th>Itens</th><th>Status</th><th>Valor</th><th></th></tr></thead><tbody>
      {quotes.map(q=><tr key={q.id}><td><b>{q.code}</b></td><td>{q.clientName||"Consumidor final"}</td><td>{new Date(q.createdAt).toLocaleDateString("pt-BR")}</td><td>{q.items.reduce((a,i)=>a+i.qty,0)}</td><td><span className="pill">{q.status}</span></td><td><b>{money(q.total)}</b></td><td className="right">{q.status==="pending"&&<button className="link-btn" onClick={()=>convert(q)}>Converter em venda</button>}</td></tr>)}
    </tbody></table></div>{quotes.length===0&&<Empty text="Nenhum orçamento salvo."/>}</div>
}

function Clients({data,setData}:{data:SignaData;setData:React.Dispatch<React.SetStateAction<SignaData>>}){
  const [open,setOpen]=useState(false);
  const [f,setF]=useState<Client>({id:"",name:""});
  const save=()=>{if(!f.name)return;setData(d=>({...d,clients:[{...f,id:f.id||uid()},...d.clients.filter(x=>x.id!==f.id)]}));setOpen(false)};
  return <div className="card"><div className="card-title"><div><h2>Clientes</h2><p>Base de clientes para vendas, orçamentos e serviços.</p></div><button className="primary" onClick={()=>{setF({id:"",name:""});setOpen(true)}}><Plus size={17}/> Novo cliente</button></div>
    <div className="table-wrap"><table><thead><tr><th>Nome</th><th>Documento</th><th>Telefone</th><th>E-mail</th><th></th></tr></thead><tbody>{data.clients.map(c=><tr key={c.id}><td><b>{c.name}</b></td><td>{c.document||"—"}</td><td>{c.phone||"—"}</td><td>{c.email||"—"}</td><td className="right"><button className="link-btn" onClick={()=>{setF(c);setOpen(true)}}>Editar</button></td></tr>)}</tbody></table></div>
    {data.clients.length===0&&<Empty text="Nenhum cliente cadastrado."/>}
    {open&&<Modal title={f.id?"Editar cliente":"Novo cliente"} onClose={()=>setOpen(false)}><div className="form-grid"><Field wide label="Nome"><input value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))}/></Field><Field label="CPF/CNPJ"><input value={f.document||""} onChange={e=>setF(x=>({...x,document:e.target.value}))}/></Field><Field label="Telefone"><input value={f.phone||""} onChange={e=>setF(x=>({...x,phone:e.target.value}))}/></Field><Field wide label="E-mail"><input value={f.email||""} onChange={e=>setF(x=>({...x,email:e.target.value}))}/></Field></div><div className="modal-actions"><button className="ghost" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary" onClick={save}>Salvar</button></div></Modal>}
  </div>
}

function Finance({data,setData}:{data:SignaData;setData:React.Dispatch<React.SetStateAction<SignaData>>}){
  const [open,setOpen]=useState(false);
  const [f,setF]=useState<Expense>({id:"",description:"",dueDate:new Date().toISOString().slice(0,10),value:0,status:"pending"});
  const pending=data.expenses.filter(e=>e.status==="pending").reduce((a,e)=>a+e.value,0);
  const paid=data.expenses.filter(e=>e.status==="paid").reduce((a,e)=>a+e.value,0);
  return <>
    <div className="kpis compact"><Kpi icon={ReceiptText} label="A pagar" value={money(pending)} hint="Pendências"/><Kpi icon={CircleDollarSign} label="Pago" value={money(paid)} hint="Despesas liquidadas"/><Kpi icon={WalletCards} label="Recebido" value={money(data.sales.filter(s=>s.type==="sale"&&s.status==="paid").reduce((a,s)=>a+s.total,0))} hint="Vendas pagas"/></div>
    <div className="card"><div className="card-title"><div><h2>Contas a pagar</h2><p>Controle simples de despesas e vencimentos.</p></div><button className="primary" onClick={()=>setOpen(true)}><Plus size={17}/> Nova despesa</button></div>
      <div className="table-wrap"><table><thead><tr><th>Descrição</th><th>Vencimento</th><th>Status</th><th>Valor</th><th></th></tr></thead><tbody>{data.expenses.map(e=><tr key={e.id}><td><b>{e.description}</b></td><td>{new Date(e.dueDate+"T12:00:00").toLocaleDateString("pt-BR")}</td><td><span className="pill">{e.status}</span></td><td><b>{money(e.value)}</b></td><td className="right">{e.status==="pending"&&<button className="link-btn" onClick={()=>setData(d=>({...d,expenses:d.expenses.map(x=>x.id===e.id?{...x,status:"paid"}:x)}))}>Marcar como paga</button>}</td></tr>)}</tbody></table></div>{data.expenses.length===0&&<Empty text="Nenhuma conta cadastrada."/>}</div>
    {open&&<Modal title="Nova conta a pagar" onClose={()=>setOpen(false)}><div className="form-grid"><Field wide label="Descrição"><input value={f.description} onChange={e=>setF(x=>({...x,description:e.target.value}))}/></Field><Field label="Vencimento"><input type="date" value={f.dueDate} onChange={e=>setF(x=>({...x,dueDate:e.target.value}))}/></Field><Field label="Valor"><input type="number" step="0.01" value={f.value} onChange={e=>setF(x=>({...x,value:+e.target.value}))}/></Field></div><div className="modal-actions"><button className="ghost" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary" onClick={()=>{setData(d=>({...d,expenses:[{...f,id:uid()},...d.expenses]}));setOpen(false)}}>Salvar</button></div></Modal>}
  </>
}

function Services({data,setData}:{data:SignaData;setData:React.Dispatch<React.SetStateAction<SignaData>>}){
  const [open,setOpen]=useState(false);
  const [f,setF]=useState<ServiceOrder>({id:"",code:"",createdAt:"",clientName:"",description:"",value:0,status:"open"});
  const save=()=>{setData(d=>({...d,serviceOrders:[{...f,id:uid(),code:nowCode("OS"),createdAt:new Date().toISOString()},...d.serviceOrders]}));setOpen(false)};
  return <div className="card"><div className="card-title"><div><h2>Ordens de serviço</h2><p>Abertura, acompanhamento e conclusão de serviços.</p></div><button className="primary" onClick={()=>setOpen(true)}><Plus size={17}/> Nova OS</button></div>
    <div className="table-wrap"><table><thead><tr><th>Número</th><th>Cliente</th><th>Descrição</th><th>Status</th><th>Valor</th><th></th></tr></thead><tbody>{data.serviceOrders.map(o=><tr key={o.id}><td><b>{o.code}</b></td><td>{o.clientName}</td><td>{o.description}</td><td><span className="pill">{o.status}</span></td><td>{money(o.value)}</td><td className="right">{o.status!=="done"&&<button className="link-btn" onClick={()=>setData(d=>({...d,serviceOrders:d.serviceOrders.map(x=>x.id===o.id?{...x,status:"done"}:x)}))}>Concluir</button>}</td></tr>)}</tbody></table></div>{data.serviceOrders.length===0&&<Empty text="Nenhuma ordem de serviço."/>}
    {open&&<Modal title="Nova ordem de serviço" onClose={()=>setOpen(false)}><div className="form-grid"><Field wide label="Cliente"><input value={f.clientName} onChange={e=>setF(x=>({...x,clientName:e.target.value}))}/></Field><Field wide label="Descrição"><textarea rows={4} value={f.description} onChange={e=>setF(x=>({...x,description:e.target.value}))}/></Field><Field label="Valor"><input type="number" step="0.01" value={f.value} onChange={e=>setF(x=>({...x,value:+e.target.value}))}/></Field></div><div className="modal-actions"><button className="ghost" onClick={()=>setOpen(false)}>Cancelar</button><button className="primary" disabled={!f.clientName||!f.description} onClick={save}>Abrir OS</button></div></Modal>}
  </div>
}

function Reports({data}:{data:SignaData}){
  const sales=data.sales.filter(s=>s.type==="sale"&&s.status!=="cancelled");
  const total=sales.reduce((a,s)=>a+s.total,0);
  const byPayment=Object.entries(sales.reduce((acc,s)=>({...acc,[s.payment]:(acc[s.payment]||0)+s.total}),{} as Record<string,number>)).sort((a,b)=>b[1]-a[1]);
  const productMap:Record<string,{name:string;qty:number;total:number}>={};
  sales.forEach(s=>s.items.forEach(i=>{productMap[i.productId]??={name:i.name,qty:0,total:0};productMap[i.productId].qty+=i.qty;productMap[i.productId].total+=i.qty*i.unitPrice}));
  const top=Object.values(productMap).sort((a,b)=>b.total-a.total).slice(0,8);
  return <div className="grid-2">
    <div className="card"><div className="card-title"><div><h2>Vendas por pagamento</h2><p>Distribuição do faturamento.</p></div></div>{byPayment.length===0?<Empty text="Sem dados de venda."/>:<div className="bars">{byPayment.map(([k,v])=><div className="bar-row" key={k}><div><span>{k}</span><b>{money(v)}</b></div><div className="bar"><i style={{width:String(total?(v/total)*100:0)+"%"}}/></div></div>)}</div>}</div>
    <div className="card"><div className="card-title"><div><h2>Produtos mais vendidos</h2><p>Por valor faturado.</p></div></div>{top.length===0?<Empty text="Sem dados de venda."/>:<div className="mini-list">{top.map(p=><div className="mini-row" key={p.name}><div><b>{p.name}</b><span>{p.qty} unidade(s)</span></div><strong>{money(p.total)}</strong></div>)}</div>}</div>
  </div>
}

function SettingsPage({data,setData}:{data:SignaData;setData:React.Dispatch<React.SetStateAction<SignaData>>}){
  const s=data.settings;
  const patch=(x:Partial<typeof s>)=>setData(d=>({...d,settings:{...d.settings,...x}}));
  const fee=(k:PaymentMethod,v:number)=>patch({paymentFees:{...s.paymentFees,[k]:v}});
  const paymentFields:[PaymentMethod,string][]=[["pix","Pix"],["cash","Dinheiro"],["card1","Cartão 1x"],["card2","Cartão 2x"],["card3","Cartão 3x"],["card4","Cartão 4x"]];
  return <div className="grid-2">
    <div className="card"><div className="card-title"><div><h2>Precificação automática</h2><p>Defina regras globais. Cada produto pode sobrescrever esses valores.</p></div></div>
      <div className="form-stack">
        <Field label="Nome da empresa"><input value={s.companyName} onChange={e=>patch({companyName:e.target.value})}/></Field>
        <Field label="Margem padrão (%)"><input type="number" value={s.defaultMargin} onChange={e=>patch({defaultMargin:+e.target.value})}/></Field>
        <Field label="Embalagem padrão por item"><input type="number" step="0.01" value={s.defaultPackagingCost} onChange={e=>patch({defaultPackagingCost:+e.target.value})}/></Field>
        <Field label="Outros custos padrão"><input type="number" step="0.01" value={s.defaultExtraCost} onChange={e=>patch({defaultExtraCost:+e.target.value})}/></Field>
      </div>
      <div className="info-box"><Calculator size={19}/><div><b>Como o preço é calculado</b><span>Preço-base = custo total ÷ (1 − margem). Depois o sistema compensa a taxa da forma de pagamento para preservar a margem.</span></div></div>
    </div>
    <div className="card"><div className="card-title"><div><h2>Taxas de pagamento</h2><p>Percentuais usados nos preços de Pix e cartão.</p></div></div>
      <div className="form-stack">{paymentFields.map(([k,l])=><Field key={k} label={l+" (%)"}><input type="number" step="0.01" value={s.paymentFees[k]} onChange={e=>fee(k,+e.target.value)}/></Field>)}</div>
    </div>
  </div>
}
