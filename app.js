'use strict';

// Local preview only: no requests, analytics, storage, or form delivery.
document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#site-navigation');
const mobileLayout = window.matchMedia('(max-width: 1180px)');

function closeMenu(restoreFocus = false) {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.menu-label').textContent = 'メニュー';
  if (restoreFocus) menuButton.focus();
}

menuButton.hidden = false;
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('.menu-label').textContent = open ? '閉じる' : 'メニュー';
  if (open) navigation.querySelector('a').focus();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu(true);
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.header-inner')) closeMenu();
});

navigation.addEventListener('focusout', (event) => {
  if (mobileLayout.matches && event.relatedTarget && !navigation.contains(event.relatedTarget) && event.relatedTarget !== menuButton) {
    closeMenu();
  }
});

mobileLayout.addEventListener('change', () => closeMenu());

function revealAnchor(hash, moveFocus = false) {
  if (!hash || !hash.startsWith('#')) return;
  const target = document.getElementById(hash.slice(1));
  if (!target) return;
  const details = target.closest('details');
  if (details) details.open = true;
  if (moveFocus) {
    const focusTarget = details ? details.querySelector('summary') : target;
    if (!focusTarget.hasAttribute('tabindex') && focusTarget.tagName !== 'SUMMARY') {
      focusTarget.setAttribute('tabindex', '-1');
    }
    focusTarget.focus({ preventScroll: true });
  }
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => {
    closeMenu();
    revealAnchor(link.getAttribute('href'), true);
  });
});
window.addEventListener('hashchange', () => revealAnchor(window.location.hash));
revealAnchor(window.location.hash);

const form = document.querySelector('#contact-form');
const message = document.querySelector('#contact-message');
const status = document.querySelector('#form-status');
const serviceHint = document.querySelector('#service-hint');
let lastServicePrompt = '';

document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    const service = link.dataset.service;
    const prompt = `${service}について相談したいです。\n`;
    // Preserve anything the visitor has already written.
    if (!message.value.trim() || message.value === lastServicePrompt) {
      message.value = prompt;
      lastServicePrompt = prompt;
      message.setCustomValidity('');
      message.removeAttribute('aria-invalid');
      serviceHint.textContent = `相談内容に「${service}」を入力しました。自由に編集できます。`;
    } else {
      serviceHint.textContent = `「${service}」のご相談：入力済みの内容を保持しています。`;
    }
    status.hidden = true;
  });
});

const fields = [...form.querySelectorAll('input, textarea')];
fields.forEach((field) => {
  field.addEventListener('input', () => {
    field.setCustomValidity('');
    field.removeAttribute('aria-invalid');
    status.hidden = true;
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  fields.forEach((field) => {
    field.setCustomValidity('');
    if (field.required && !field.value.trim()) {
      field.setCustomValidity('この項目を入力してください。');
    }
    if (field.checkValidity()) field.removeAttribute('aria-invalid');
    else field.setAttribute('aria-invalid', 'true');
  });
  if (!form.checkValidity()) {
    status.hidden = true;
    form.reportValidity();
    return;
  }
  status.textContent = '入力内容を確認しました。このフォームは提案プレビュー用のため、送信されていません。入力内容は外部へ送信・保存されません。';
  status.hidden = false;
  status.focus();
});

// Enable only after the submit-prevention handler is registered.
form.querySelector('button[type="submit"]').disabled = false;
