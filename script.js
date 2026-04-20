function setHeaderState() {
  const stickyTarget = document.querySelector('#header-placeholder .site-header, .site-header');
  if (!stickyTarget) return;
  stickyTarget.classList.toggle('scrolled', window.scrollY > 12);
}

function buildMobileMenu(header) {
  if (!header) return null;

  const headerMain = header.querySelector('.header-main');
  const menuToggle = header.querySelector('.menu-toggle');
  if (!headerMain || !menuToggle) return null;

  let navMenu = header.querySelector('.nav-menu');
  if (!navMenu) {
    navMenu = document.createElement('div');
    navMenu.className = 'nav-menu';
    navMenu.id = 'nav-menu';
    navMenu.innerHTML = `
      <button class="close-menu-btn" aria-label="Închide meniul">&times;</button>
      <div class="nav-center"></div>
      <div class="nav-actions"></div>
    `;
    headerMain.appendChild(navMenu);
  }

  const navCenter = navMenu.querySelector('.nav-center');
  const navActions = navMenu.querySelector('.nav-actions');
  if (!navCenter || !navActions) return null;

  const brand = header.querySelector('.header-brand');
  const headerCats = Array.from(header.querySelectorAll('.header-cats a'));
  const phoneLink = header.querySelector('.header-contact');
  const ctaLink = header.querySelector('.header-cta');
  const whatsappLink = header.querySelector('.header-social .whatsapp');
  const mailLink = header.querySelector('.header-social .mail');

  const menuLinks = headerCats.map((link) => ({
    href: link.getAttribute('href') || '#',
    label: link.textContent.trim()
  }));

  const uniqueMenuLinks = menuLinks.filter((link, index, arr) => {
    return index === arr.findIndex((item) => item.href === link.href && item.label === link.label);
  });

  navCenter.innerHTML = uniqueMenuLinks
    .map((link) => `<a href="${link.href}">${link.label}</a>`)
    .join('');

  let actionsHtml = '';
  if (phoneLink) {
    actionsHtml += `<a class="mobile-link-btn phone" href="${phoneLink.getAttribute('href') || '#'}">Sună acum</a>`;
  }
  if (ctaLink) {
    actionsHtml += `<a class="mobile-link-btn offer" href="${ctaLink.getAttribute('href') || '#'}">Cere ofertă</a>`;
  }
  if (whatsappLink || mailLink) {
    actionsHtml += '<div class="mobile-socials">';
    if (whatsappLink) {
      actionsHtml += `<a class="whatsapp" href="${whatsappLink.getAttribute('href') || '#'}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`;
    }
    if (mailLink) {
      actionsHtml += `<a class="mail" href="${mailLink.getAttribute('href') || '#'}">Email</a>`;
    }
    actionsHtml += '</div>';
  }
  navActions.innerHTML = actionsHtml;

  return { menuToggle, navMenu };
}

function initHeaderMenu() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const built = buildMobileMenu(header);
  if (!built) return;

  const { menuToggle, navMenu } = built;
  if (menuToggle.dataset.mobileBound === 'true') return;
  menuToggle.dataset.mobileBound = 'true';

  const closeMenu = () => {
    navMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('active');
    document.body.classList.remove('menu-open');
  };

  navMenu.querySelector('.close-menu-btn')?.addEventListener('click', closeMenu);

  menuToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = navMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.classList.toggle('active', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  });

  navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!header.contains(target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1023) closeMenu();
  });
}

function initReveal() {
  const revealNodes = document.querySelectorAll('[data-reveal]');
  if (!revealNodes.length || !('IntersectionObserver' in window)) {
    revealNodes.forEach((node) => node.classList.add('revealed'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
  );

  revealNodes.forEach((node, index) => {
    node.style.transitionDelay = `${Math.min(index * 0.08, 0.28)}s`;
    revealObserver.observe(node);
  });
}

function initLeadForms() {
  document.querySelectorAll('.lead-form').forEach((leadForm) => {
    if (leadForm.dataset.bound === 'true') return;
    leadForm.dataset.bound = 'true';

    let formStatus = leadForm.parentElement?.querySelector('.form-status');
    if (!formStatus) {
      formStatus = document.createElement('p');
      formStatus.className = 'form-status';
      formStatus.setAttribute('aria-live', 'polite');
      leadForm.insertAdjacentElement('afterend', formStatus);
    }

    leadForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(leadForm);
      const name = String(formData.get('name') || '').trim();
      const phone = String(formData.get('phone') || '').trim();
      const city = String(formData.get('city') || '').trim();
      const service = String(formData.get('service') || '').trim();
      const phoneLooksValid = /^[0-9+\s()-]{8,}$/.test(phone);

      if (!name || !phone || !city || !service) {
        formStatus.textContent = 'Completează toate câmpurile pentru a trimite cererea.';
        formStatus.style.color = '#ffd4d4';
        return;
      }

      if (!phoneLooksValid) {
        formStatus.textContent = 'Numărul de telefon introdus nu este valid.';
        formStatus.style.color = '#ffd4d4';
        return;
      }

      formStatus.textContent = 'Mesajul a fost trimis. Revenim în cel mai scurt timp.';
      formStatus.style.color = '#caf8da';
      leadForm.reset();
    });
  });
}

function bindDots(container, dotsContainer, itemSelector, dotClass, ariaLabelPrefix) {
  if (!container || !dotsContainer) return;
  const items = container.querySelectorAll(itemSelector);
  if (!items.length) return;

  dotsContainer.innerHTML = Array.from(items, (_, i) =>
    `<button class="${dotClass} ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="${ariaLabelPrefix} ${i + 1}"></button>`
  ).join('');

  const dots = dotsContainer.querySelectorAll(`.${dotClass}`);

  const getStep = () => {
    const firstItem = container.querySelector(itemSelector);
    if (!firstItem) return container.clientWidth;
    const gap = parseFloat(getComputedStyle(container).gap) || 0;
    return firstItem.getBoundingClientRect().width + gap;
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.currentTarget.dataset.index, 10);
      container.scrollTo({
        left: targetIndex * getStep(),
        behavior: 'smooth'
      });
    });
  });

  const syncDots = () => {
    const step = getStep();
    if (!step) return;
    const activeIndex = Math.round(container.scrollLeft / step);
    dots.forEach((dot, index) => dot.classList.toggle('active', index === activeIndex));
  };

  container.addEventListener('scroll', syncDots, { passive: true });
  window.addEventListener('resize', syncDots);
  syncDots();
}

function initProductSwitcher() {
  const categoryCards = document.querySelectorAll('.category-card[data-category]');
  const productCardsContainer = document.getElementById('product-cards');
  const dotsContainer = document.getElementById('slider-dots');
  if (!categoryCards.length || !productCardsContainer) return;
  if (productCardsContainer.dataset.bound === 'true') return;
  productCardsContainer.dataset.bound = 'true';

  const productsData = {
    ferestre: [
      { img: 'images/WhatsApp Image 2026-04-07 at 10.18.30 (1).jpeg', alt: 'Fereastră PVC albă', title: 'Ferestre PVC' },
      { img: 'images/WhatsApp Image 2026-04-07 at 10.18.31 (11).jpeg', alt: 'Fereastră PVC cu finisaj modern', title: 'Ferestre Termopan' },
      { img: 'images/WhatsApp Image 2026-04-07 at 10.18.31 (4).jpeg', alt: 'Montaj fereastră realizat profesionist', title: 'Montaj Ferestre' },
      { img: 'images/WhatsApp Image 2026-04-09 at 09.35.16.jpeg', alt: 'Detaliu tâmplărie PVC', title: 'Soluții PVC' }
    ],
    'usi-pvc': [
      { img: 'images/WhatsApp Image 2026-04-07 at 10.18.30 (10).jpeg', alt: 'Ușă PVC de intrare', title: 'Uși PVC' },
      { img: 'images/WhatsApp Image 2026-04-07 at 10.18.30 (6).jpeg', alt: 'Ușă PVC montată', title: 'Uși de intrare' },
      { img: 'images/WhatsApp Image 2026-04-07 at 10.18.31 (2).jpeg', alt: 'Lucrare ușă PVC finalizată', title: 'Montaj uși PVC' },
      { img: 'images/WhatsApp Image 2026-04-09 at 09.35.16 (3).jpeg', alt: 'Detaliu lucrare ușă PVC', title: 'Finisaje uși PVC' }
    ],
    'usi-glisante': [
      { img: 'images/usi-glis3.jpeg', alt: 'Sistem glisant cu oglindă', title: 'Glisantă pentru terasă' },
      { img: 'images/usi-glis2.jpeg', alt: 'Glisantă de interior', title: 'Glisantă de interior' },
      { img: 'images/usi-glis1.jpeg', alt: 'Glisantă pentru terasă', title: 'Sistem glisant cu oglindă' },
      { img: 'images/usi-glis4.jpeg', alt: 'Glisantă pentru exterior', title: 'Glisantă pentru exterior' }
    ]
  };

  const renderProducts = (category) => {
    const products = productsData[category];
    if (!products) return;

    productCardsContainer.innerHTML = products.map((product, index) => {
      const focusClass = product.title === 'Ferestre Termopan' ? 'focus-75' : product.title === 'Soluții PVC' ? 'focus-bottom' : product.title === 'Glisantă pentru terasă' ? 'focus-right' : '';
      const isGlisanteD = category === 'usi-glisante' && (product.img.includes('usi-glis3') || product.img.includes('usi-glis4'));
      const imgHtml = isGlisanteD ? `
        <picture>
          <source media="(min-width: 1024px)" srcset="${product.img.replace('.jpeg', 'd.jpeg')}">
          <img src="${product.img}" alt="${product.alt}" class="${focusClass}" />
        </picture>
      ` : `<img src="${product.img}" alt="${product.alt}" class="${focusClass}" />`;
      return `
        <article class="product-card-compact">
          ${imgHtml}
          <h4>${product.title}</h4>
          <a href="contact.html" class="btn btn-outline">Cere ofertă</a>
        </article>
      `;
    }).join('');

    productCardsContainer.scrollLeft = 0;
    bindDots(productCardsContainer, dotsContainer, '.product-card-compact', 'slider-dot', 'Slide');
  };

  categoryCards.forEach((card) => {
    card.addEventListener('click', () => {
      categoryCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      renderProducts(card.dataset.category);
    });
  });

  renderProducts('ferestre');
}

function initSliders() {
  bindDots(document.querySelector('.gallery-grid'), document.getElementById('gallery-dots'), '.gallery-item', 'gallery-dot', 'Imagine');
  bindDots(document.querySelector('.services-grid'), document.getElementById('services-dots'), '.service-card', 'services-dot', 'Serviciu');

  const showcaseFerestre = document.getElementById('showcase-dots-ferestre');
  if (showcaseFerestre) bindDots(showcaseFerestre.previousElementSibling, showcaseFerestre, '.product-item', 'category-dot', 'Produs');

  const galleryFerestre = document.getElementById('gallery-dots-ferestre');
  if (galleryFerestre) bindDots(galleryFerestre.previousElementSibling, galleryFerestre, '.product-item', 'category-gallery-dot', 'Imagine');

  const showcaseUsi = document.getElementById('showcase-dots-usi-pvc');
  if (showcaseUsi) bindDots(showcaseUsi.previousElementSibling, showcaseUsi, '.product-item', 'category-dot', 'Produs');

  const galleryUsi = document.getElementById('gallery-dots-usi-pvc');
  if (galleryUsi) bindDots(galleryUsi.previousElementSibling, galleryUsi, '.product-item', 'category-gallery-dot', 'Imagine');

  const showcaseGlisante = document.getElementById('showcase-dots-usi-glisante');
  if (showcaseGlisante) bindDots(showcaseGlisante.previousElementSibling, showcaseGlisante, '.product-item', 'category-dot', 'Produs');

  const galleryGlisante = document.getElementById('gallery-dots-usi-glisante');
  if (galleryGlisante) bindDots(galleryGlisante.previousElementSibling, galleryGlisante, '.product-item', 'category-gallery-dot', 'Imagine');
}

function initSite() {
  initHeaderMenu();
  initReveal();
  initLeadForms();
  initProductSwitcher();
  initSliders();
  setHeaderState();
}

document.addEventListener('DOMContentLoaded', initSite);
document.addEventListener('includes:loaded', initSite);
window.addEventListener('load', initSite);
window.addEventListener('scroll', setHeaderState, { passive: true });
