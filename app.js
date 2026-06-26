// TechNova — App estático
(function(){
  const LS = {
    cart: 'tn_cart',
    user: 'tn_user',
    users: 'tn_users',
    orders: 'tn_orders',
    services: 'tn_services',
  };
  const fmt = n => 'R$ ' + n.toFixed(2).replace('.', ',');
  const stars = n => '★'.repeat(n) + '☆'.repeat(5-n);

  // ----- Storage helpers -----
  function getCart(){ try{return JSON.parse(localStorage.getItem(LS.cart))||[]}catch{return []} }
  function setCart(c){ localStorage.setItem(LS.cart, JSON.stringify(c)); updateCartBadge(); }
  function getUsers(){ try{return JSON.parse(localStorage.getItem(LS.users))||[]}catch{return []} }
  function setUsers(u){ localStorage.setItem(LS.users, JSON.stringify(u)); }
  function getUser(){ try{return JSON.parse(localStorage.getItem(LS.user))}catch{return null} }
  function setUser(u){ if(u) localStorage.setItem(LS.user, JSON.stringify(u)); else localStorage.removeItem(LS.user); updateUserUI(); }
  function getOrders(){ try{return JSON.parse(localStorage.getItem(LS.orders))||[]}catch{return []} }
  function setOrders(o){ localStorage.setItem(LS.orders, JSON.stringify(o)); }
  function getServices(){ try{return JSON.parse(localStorage.getItem(LS.services))||[]}catch{return []} }
  function setServices(s){ localStorage.setItem(LS.services, JSON.stringify(s)); }

  // ----- Toast -----
  function toast(msg){
    let t = document.querySelector('.toast');
    if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg;
    requestAnimationFrame(()=>t.classList.add('show'));
    clearTimeout(t._h);
    t._h = setTimeout(()=>t.classList.remove('show'), 2200);
  }

  // ----- Find item across catalogs -----
  function findItem(id){
    const d = window.TECHNOVA_DATA;
    return d.products.find(p=>p.id===id) || d.services.find(s=>s.id===id) || d.rentals.find(r=>r.id===id);
  }
  function itemKind(id){
    const d = window.TECHNOVA_DATA;
    if(d.products.find(p=>p.id===id)) return 'produto';
    if(d.services.find(s=>s.id===id)) return 'serviço';
    if(d.rentals.find(r=>r.id===id)) return 'locação';
    return '';
  }

  // ----- Cart actions -----
  window.addToCart = function(id){
    const cart = getCart();
    const ex = cart.find(c=>c.id===id);
    if(ex) ex.qty++; else cart.push({id, qty:1});
    setCart(cart);
    toast('✓ Adicionado ao carrinho');
  };
  window.removeFromCart = function(id){
    setCart(getCart().filter(c=>c.id!==id));
    if(typeof renderCart==='function') renderCart();
  };
  window.changeQty = function(id, delta){
    const cart = getCart();
    const it = cart.find(c=>c.id===id); if(!it) return;
    it.qty = Math.max(1, it.qty + delta);
    setCart(cart);
    if(typeof renderCart==='function') renderCart();
  };

  function updateCartBadge(){
    const el = document.querySelector('[data-cart-count]'); if(!el) return;
    const total = getCart().reduce((a,c)=>a+c.qty,0);
    el.textContent = total;
    el.style.display = total ? 'grid' : 'none';
  }

  function updateUserUI(){
    const u = getUser();
    document.querySelectorAll('[data-user-name]').forEach(el=>el.textContent = u ? u.name : '');
    document.querySelectorAll('[data-auth-guest]').forEach(el=>el.style.display = u ? 'none' : '');
    document.querySelectorAll('[data-auth-user]').forEach(el=>el.style.display = u ? '' : 'none');
  }

  // ----- Card renderer -----
  function cardHTML(item, kind){
    const promo = item.promo ? '<span class="badge promo">OFERTA</span>' : (kind==='locacao'?'<span class="badge">LOCAÇÃO</span>':'');
    const old = item.old ? `<small>${fmt(item.old)}</small>` : '';
    const unit = item.unit ? ` <small style="font-size:.75rem;color:var(--muted);font-weight:400">/${item.unit}</small>` : '';
    return `
      <article class="card">
        <div class="card-media">${promo}<span aria-hidden="true">${item.emoji}</span></div>
        <div class="card-body">
          <h3>${item.name}</h3>
          <div class="rating" aria-label="Avaliação ${item.rating} de 5">${stars(item.rating)}</div>
          <p class="desc">${item.desc}</p>
          <div class="price-row">
            <div class="price">${fmt(item.price)}${unit}${old}</div>
            <button class="btn btn-primary btn-sm" onclick="addToCart('${item.id}')">Adicionar</button>
          </div>
        </div>
      </article>`;
  }

  // ----- Catalog grid renderer -----
  window.renderCatalog = function(opts){
    const { container, items, kind, categories, filterId='filterChips', searchId='searchInput' } = opts;
    const $c = document.getElementById(container);
    const $f = document.getElementById(filterId);
    const $s = document.getElementById(searchId);
    let activeCat = 'all'; let q = '';

    if($f && categories){
      $f.innerHTML = `<button class="chip active" data-cat="all">Todos</button>` +
        categories.map(c=>`<button class="chip" data-cat="${c.id}">${c.icon} ${c.name}</button>`).join('');
      $f.addEventListener('click', e=>{
        const btn = e.target.closest('.chip'); if(!btn) return;
        activeCat = btn.dataset.cat;
        $f.querySelectorAll('.chip').forEach(b=>b.classList.toggle('active', b===btn));
        draw();
      });
    }
    if($s){
      $s.addEventListener('input', e=>{ q = e.target.value.toLowerCase(); draw(); });
    }
    function draw(){
      const filtered = items.filter(i=>
        (activeCat==='all'||i.cat===activeCat) &&
        (!q || (i.name+i.desc).toLowerCase().includes(q))
      );
      $c.innerHTML = filtered.length
        ? filtered.map(i=>cardHTML(i,kind)).join('')
        : `<div class="empty-state" style="grid-column:1/-1"><span class="emoji">🔍</span>Nenhum resultado encontrado</div>`;
    }
    draw();
  };

  // ----- Cart page -----
  window.renderCart = function(){
    const $list = document.getElementById('cartList');
    const $sum = document.getElementById('cartSummary');
    if(!$list||!$sum) return;
    const cart = getCart();
    if(!cart.length){
      $list.innerHTML = `<div class="empty-state"><span class="emoji">🛒</span><h3>Seu carrinho está vazio</h3><p>Adicione produtos, serviços ou itens de locação.</p><a href="catalogo.html" class="btn btn-primary" style="margin-top:1rem">Ver produtos</a></div>`;
      $sum.innerHTML = '';
      return;
    }
    let subtotal = 0;
    $list.innerHTML = cart.map(c=>{
      const it = findItem(c.id); if(!it) return '';
      const total = it.price * c.qty; subtotal += total;
      const unit = it.unit ? `/${it.unit}` : '';
      return `
        <div class="cart-item">
          <div class="cart-item-media">${it.emoji}</div>
          <div>
            <h4>${it.name}</h4>
            <div class="meta">${itemKind(it.id)} · ${fmt(it.price)}${unit}</div>
            <div class="qty" style="margin-top:.5rem">
              <button onclick="changeQty('${it.id}',-1)" aria-label="Diminuir">−</button>
              <span>${c.qty}</span>
              <button onclick="changeQty('${it.id}',1)" aria-label="Aumentar">+</button>
            </div>
          </div>
          <div class="actions" style="text-align:right">
            <div class="price" style="font-size:1.05rem">${fmt(total)}</div>
            <button class="btn btn-ghost btn-sm" onclick="removeFromCart('${it.id}')" style="margin-top:.4rem">Remover</button>
          </div>
        </div>`;
    }).join('');
    const frete = subtotal >= 500 ? 0 : 29.90;
    const total = subtotal + frete;
    $sum.innerHTML = `
      <h3 style="margin-top:0">Resumo</h3>
      <div class="summary-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
      <div class="summary-row"><span>Frete ${frete===0?'<small style="color:var(--success)">(grátis)</small>':''}</span><span>${fmt(frete)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${fmt(total)}</span></div>
      <button class="btn btn-primary btn-block" style="margin-top:1rem" onclick="checkout()">Finalizar pedido</button>
      <a href="catalogo.html" class="btn btn-ghost btn-block" style="margin-top:.5rem">Continuar comprando</a>`;
  };

  window.checkout = function(){
    const u = getUser();
    if(!u){ toast('Faça login para finalizar'); setTimeout(()=>location.href='login.html', 1000); return; }
    const cart = getCart(); if(!cart.length) return;
    const orderItems = cart.map(c=>({...c, item:findItem(c.id)}));
    const subtotal = orderItems.reduce((a,c)=>a + c.item.price*c.qty, 0);
    const frete = subtotal >= 500 ? 0 : 29.90;
    const order = {
      id: 'PED-' + Date.now().toString().slice(-6),
      date: new Date().toISOString(),
      user: u.email,
      items: orderItems.map(c=>({id:c.id,name:c.item.name,qty:c.qty,price:c.item.price,kind:itemKind(c.id)})),
      total: subtotal + frete,
      status: 'Confirmado'
    };
    const orders = getOrders(); orders.unshift(order); setOrders(orders);
    // Servicos/locacoes separados
    const services = getServices();
    orderItems.forEach(c=>{
      const k = itemKind(c.id);
      if(k==='serviço'||k==='locação'){
        services.unshift({ id:'OS-'+Date.now()+Math.random().toString(36).slice(2,5), name:c.item.name, kind:k, date:new Date().toISOString(), status:'Agendado', price:c.item.price*c.qty });
      }
    });
    setServices(services);
    setCart([]);
    toast('Pedido '+order.id+' confirmado!');
    setTimeout(()=>location.href='conta.html', 1200);
  };

  // ----- Auth -----
  window.registerUser = function(e){
    e.preventDefault();
    const f = e.target;
    const name = f.name.value.trim();
    const email = f.email.value.trim().toLowerCase();
    const pwd = f.password.value;
    if(pwd.length<6){ toast('Senha mínima de 6 caracteres'); return false; }
    const users = getUsers();
    if(users.find(u=>u.email===email)){ toast('E-mail já cadastrado'); return false; }
    const user = { name, email, password: btoa(pwd), createdAt: Date.now() };
    users.push(user); setUsers(users);
    setUser({name, email});
    toast('Conta criada com sucesso!');
    setTimeout(()=>location.href='conta.html', 900);
    return false;
  };
  window.loginUser = function(e){
    e.preventDefault();
    const f = e.target;
    const email = f.email.value.trim().toLowerCase();
    const pwd = f.password.value;
    const user = getUsers().find(u=>u.email===email && u.password===btoa(pwd));
    if(!user){ toast('Credenciais inválidas'); return false; }
    setUser({name:user.name, email:user.email});
    toast('Bem-vindo, '+user.name+'!');
    setTimeout(()=>location.href='conta.html', 800);
    return false;
  };
  window.recoverPassword = function(e){
    e.preventDefault();
    const email = e.target.email.value.trim().toLowerCase();
    if(getUsers().find(u=>u.email===email)){
      toast('✓ Link de recuperação enviado (simulado)');
    } else {
      toast('E-mail não encontrado');
    }
    e.target.reset();
    return false;
  };
  window.logoutUser = function(){
    setUser(null);
    toast('Sessão encerrada');
    setTimeout(()=>location.href='index.html', 600);
  };

  // ----- Account page -----
  window.renderAccount = function(){
    const u = getUser();
    if(!u){ location.href='login.html'; return; }
    document.getElementById('userGreeting').textContent = 'Olá, '+u.name;
    document.getElementById('userEmail').textContent = u.email;
    // Tabs
    document.querySelectorAll('.tab').forEach(t=>{
      t.addEventListener('click', ()=>{
        document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
        t.classList.add('active');
        document.getElementById(t.dataset.tab).classList.add('active');
      });
    });
    // Orders
    const orders = getOrders().filter(o=>o.user===u.email);
    const $o = document.getElementById('ordersTable');
    $o.innerHTML = orders.length ? `
      <table class="table"><thead><tr><th>Pedido</th><th>Data</th><th>Itens</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>${orders.map(o=>`<tr><td>${o.id}</td><td>${new Date(o.date).toLocaleDateString('pt-BR')}</td><td>${o.items.length}</td><td>${fmt(o.total)}</td><td><span class="status ok">${o.status}</span></td></tr>`).join('')}</tbody></table>
    ` : `<div class="empty-state"><span class="emoji">📦</span>Você ainda não fez pedidos</div>`;
    // Services
    const services = getServices();
    const $s = document.getElementById('servicesTable');
    $s.innerHTML = services.length ? `
      <table class="table"><thead><tr><th>OS</th><th>Item</th><th>Tipo</th><th>Data</th><th>Valor</th><th>Status</th></tr></thead>
      <tbody>${services.map(s=>`<tr><td>${s.id.slice(0,12)}</td><td>${s.name}</td><td>${s.kind}</td><td>${new Date(s.date).toLocaleDateString('pt-BR')}</td><td>${fmt(s.price)}</td><td><span class="status pending">${s.status}</span></td></tr>`).join('')}</tbody></table>
    ` : `<div class="empty-state"><span class="emoji">🔧</span>Nenhum serviço/locação contratado</div>`;
    // Profile form
    const $p = document.getElementById('profileForm');
    if($p){
      $p.name.value = u.name;
      $p.email.value = u.email;
      $p.addEventListener('submit', e=>{
        e.preventDefault();
        const users = getUsers();
        const idx = users.findIndex(x=>x.email===u.email);
        if(idx>=0){
          users[idx].name = $p.name.value.trim();
          setUsers(users);
          setUser({name:users[idx].name, email:users[idx].email});
          document.getElementById('userGreeting').textContent = 'Olá, '+users[idx].name;
          toast('Dados atualizados');
        }
      });
    }
  };

  // ----- Mobile menu -----
  function bindMenu(){
    const btn = document.querySelector('.menu-toggle');
    const links = document.querySelector('.nav-links');
    if(btn && links) btn.addEventListener('click', ()=>links.classList.toggle('open'));
  }

  // ----- Init on every page -----
  document.addEventListener('DOMContentLoaded', ()=>{
    updateCartBadge();
    updateUserUI();
    bindMenu();
    // mark active nav link by pathname
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a=>{
      const href = a.getAttribute('href');
      if(href===path) a.classList.add('active');
    });
  });
})();