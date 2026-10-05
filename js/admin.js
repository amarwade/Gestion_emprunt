document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('account-form');
  const list = document.getElementById('accounts-list');
  const listMessage = document.getElementById('list-message');
  const formMessage = document.getElementById('form-message');
  const createButton = document.getElementById('create-btn');

  function showFormMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.className = `notice ${isError ? 'error' : 'success'}`;
    formMessage.hidden = false;
  }

  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      credentials: 'same-origin'
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Une erreur est survenue.');
    return data;
  }

  try {
    const session = await api('/api/check-session');
    if (!session.authenticated || session.student?.role !== 'admin') {
      window.location.replace('login.html');
      return;
    }
    document.getElementById('admin-welcome').textContent = `Connecté : ${session.student.prenom} ${session.student.nom}`;
  } catch {
    window.location.replace('login.html');
    return;
  }

  async function loadAccounts() {
    listMessage.textContent = 'Chargement des comptes…';
    try {
      const result = await api('/api/admin/accounts');
      list.replaceChildren();
      result.data.forEach(account => {
        const row = document.createElement('tr');
        [account.student_id, account.nom, account.prenom].forEach(value => {
          const cell = document.createElement('td');
          cell.textContent = value;
          row.appendChild(cell);
        });
        const roleCell = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = 'role-badge';
        badge.textContent = account.role === 'admin' ? 'Administrateur' : 'Étudiant';
        roleCell.appendChild(badge);
        row.appendChild(roleCell);
        const dateCell = document.createElement('td');
        dateCell.textContent = account.dateInscription || '—';
        row.appendChild(dateCell);
        list.appendChild(row);
      });
      listMessage.textContent = result.data.length ? '' : 'Aucun compte trouvé.';
    } catch (error) {
      listMessage.textContent = error.message;
    }
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    formMessage.hidden = true;
    if (!form.reportValidity()) return;
    createButton.disabled = true;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const result = await api('/api/admin/accounts', {
        method: 'POST',
        body: JSON.stringify(values)
      });
      showFormMessage(result.message || 'Compte créé.');
      form.reset();
      await loadAccounts();
    } catch (error) {
      showFormMessage(error.message, true);
    } finally {
      createButton.disabled = false;
    }
  });

  document.getElementById('refresh-btn').addEventListener('click', loadAccounts);
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try { await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' }); } catch {}
    localStorage.removeItem('eduloan_auth');
    localStorage.removeItem('eduloan_user');
    window.location.replace('login.html');
  });

  await loadAccounts();
});
