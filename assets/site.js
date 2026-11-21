/* php-sso site: the sign-in you can try. No libraries, no network requests. */
(() => {
  'use strict';

  /** Builds an element. Text goes in as text, never as HTML. */
  const h = (tag, props = {}, ...kids) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (key === 'class') node.className = value;
      else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
      else if (value === true) node.setAttribute(key, '');
      else if (value !== false && value != null) node.setAttribute(key, value);
    }
    for (const kid of kids) if (kid !== false && kid != null) node.append(kid);
    return node;
  };

  const root = document.getElementById('try');
  if (root) simulator(root);

  function simulator(root) {
    const stepBox = root.querySelector('[data-step]');
    const tokenBox = root.querySelector('[data-token]');
    const switchBox = root.querySelector('#try-mfa');
    const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const state = { email: '', first: null, second: null };

    const isCompany = (email) => email.toLowerCase().endsWith('@acme.com');
    const show = (...nodes) => stepBox.replaceChildren(...nodes);
    const focusFirst = () => stepBox.querySelector('input, button')?.focus();
    const title = (text) => h('p', { class: 'step-title' }, text);

    function reset() {
      state.email = '';
      state.first = null;
      state.second = null;
      identify('', true);
    }

    function identify(error = '', focus = false) {
      switchBox.disabled = false;
      tokenBox.hidden = true;
      const input = h('input', { id: 'try-email', type: 'email', name: 'email', autocomplete: 'username', required: true, value: state.email, 'aria-describedby': error ? 'try-error' : null });
      const use = (address) => () => { input.value = address; input.focus(); };
      show(
        title('Sign in'),
        h('p', {}, 'Enter your email address. php-sso decides what to ask next.'),
        h('form', {
          novalidate: true,
          onsubmit: (event) => {
            event.preventDefault();
            state.email = input.value.trim();
            if (!EMAIL.test(state.email)) return identify('Enter an email address, like alice@example.com.', true);
            switchBox.disabled = true;
            return isCompany(state.email) ? viaCompany(true) : password('', true);
          },
        },
          h('label', { for: 'try-email' }, 'Email address'),
          input,
          error && h('p', { class: 'err', id: 'try-error', role: 'alert' }, error),
          h('div', { class: 'row' }, h('button', { class: 'try-btn', type: 'submit' }, 'Continue')),
          h('div', { class: 'chips' },
            h('button', { class: 'link', type: 'button', onclick: use('alice@example.com') }, 'Use alice@example.com'),
            h('button', { class: 'link', type: 'button', onclick: use('sam@acme.com') }, 'Use sam@acme.com, a company with SAML'),
          ),
        ),
      );
      if (focus) focusFirst();
    }

    function password(error = '', focus = false) {
      state.first = 'pwd';
      const input = h('input', { id: 'try-password', type: 'password', name: 'password', autocomplete: 'current-password', required: true, 'aria-describedby': error ? 'try-error' : null });
      show(
        title('Enter your password'),
        h('p', {}, 'Signing in as ', h('b', {}, state.email), '. ', h('button', { class: 'link', type: 'button', onclick: () => identify('', true) }, 'Not you?')),
        h('form', {
          novalidate: true,
          onsubmit: (event) => {
            event.preventDefault();
            if (input.value === '') return password('Enter a password. Any text works here.', true);
            return next();
          },
        },
          h('label', { for: 'try-password' }, 'Password'),
          input,
          error && h('p', { class: 'err', id: 'try-error', role: 'alert' }, error),
          h('div', { class: 'row' }, h('button', { class: 'try-btn', type: 'submit' }, 'Continue')),
        ),
      );
      if (focus) focusFirst();
    }

    function viaCompany(focus = false) {
      show(
        title('acme.com signs in through its own identity provider'),
        h('p', {}, 'A real sign-in would send this browser to Acme’s Okta or Entra. It signs the person in and sends a signed answer back, with no password page here.'),
        h('div', { class: 'row' },
          h('button', { class: 'try-btn', type: 'button', onclick: () => { state.first = 'fed'; next(); } }, 'Sign in at Acme'),
          h('button', { class: 'link', type: 'button', onclick: () => identify('', true) }, 'Use another address'),
        ),
      );
      if (focus) focusFirst();
    }

    function next() {
      return switchBox.checked ? code(false, '', true) : done();
    }

    function code(recovery, error = '', focus = false) {
      const input = h('input', {
        id: 'try-code', type: 'text', name: 'code', required: true,
        inputmode: recovery ? 'text' : 'numeric', autocomplete: 'one-time-code',
        maxlength: recovery ? '24' : '6', 'aria-describedby': error ? 'try-error' : null,
      });
      show(
        title(recovery ? 'Enter a recovery code' : 'Enter the code from your app'),
        h('p', {}, recovery ? 'Use one of the codes you saved when you set up two-step verification. Any text works here.' : 'Open your authenticator app and type the 6 digits. Any 6 digits work here.'),
        h('form', {
          novalidate: true,
          onsubmit: (event) => {
            event.preventDefault();
            const value = input.value.trim();
            if (recovery ? value === '' : !/^\d{6}$/.test(value)) {
              return code(recovery, recovery ? 'Enter a recovery code.' : 'Enter the 6 digits from your authenticator app.', true);
            }
            state.second = recovery ? 'recovery' : 'otp';
            return done();
          },
        },
          h('label', { for: 'try-code' }, recovery ? 'Recovery code' : 'Code'),
          input,
          error && h('p', { class: 'err', id: 'try-error', role: 'alert' }, error),
          h('div', { class: 'row' },
            h('button', { class: 'try-btn', type: 'submit' }, 'Continue'),
            h('button', { class: 'link', type: 'button', onclick: () => code(!recovery, '', true) }, recovery ? 'Use the authenticator app instead' : 'Use a recovery code instead'),
          ),
        ),
      );
      if (focus) focusFirst();
    }

    /** How the person signed in, as the `amr` of the ID token. */
    function methods() {
      const list = [state.first === 'fed' ? 'fed' : 'pwd'];
      if (state.second === 'otp') list.push('otp', 'mfa');
      if (state.second === 'recovery') list.push('mfa');
      return list;
    }

    function explanation() {
      const who = state.first === 'fed' ? 'Acme’s identity provider vouched for this person, so there is no pwd. ' : 'A password was used. ';
      if (state.second === 'otp') return who + 'The code from the app was checked here too, so the app sees otp and mfa and can let this person in.';
      if (state.second === 'recovery') return who + 'A recovery code counts as mfa, but not as otp, because it did not come from the app.';
      return who + 'No second factor was used, so an app that requires mfa would turn this sign-in away.';
    }

    function done() {
      switchBox.disabled = true;
      const now = Math.floor(Date.now() / 1000);
      const local = state.email.split('@')[0];
      const name = local.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const claims = [
        ['iss', JSON.stringify('https://sso.example.com')],
        ['sub', JSON.stringify('3f2c9d4e-7a1b-4c58-9b0e-5d2a6c81f4e3')],
        ['aud', JSON.stringify('your-app')],
        ['iat', String(now)],
        ['exp', String(now + 3600)],
        ['auth_time', String(now)],
        ['amr', JSON.stringify(methods()).replace(/,/g, ', ')],
        ['email', JSON.stringify(state.email)],
        ['name', JSON.stringify(name)],
      ];
      const block = h('code', {}, '{\n');
      claims.forEach(([key, value], index) => {
        const line = `  "${key}": ${value}${index < claims.length - 1 ? ',' : ''}`;
        block.append(key === 'amr' ? h('mark', {}, line) : line, '\n');
      });
      block.append('}');

      show(
        title('Signed in'),
        h('p', {}, 'You are signed in as ', h('b', {}, state.email), '. php-sso now gives the app an ID token.'),
        h('div', { class: 'row' }, h('button', { class: 'link', type: 'button', onclick: reset }, 'Start over')),
      );
      tokenBox.replaceChildren(
        h('h3', {}, 'What your app receives'),
        h('pre', { tabindex: '0', 'aria-label': 'Example ID token claims' }, block),
        h('p', { class: 'why' }, explanation()),
      );
      tokenBox.hidden = false;
      focusFirst();
    }

    identify();
  }
})();
