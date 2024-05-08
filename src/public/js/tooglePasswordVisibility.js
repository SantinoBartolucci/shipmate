const closedLock = '/img/lock-solid.svg';
const openedLock = '/img/lock-open-solid.svg';

function ToogleVisibility(btnId, lockId) {
    const btn = document.getElementById(btnId);
    const lock = document.getElementById(lockId);
    btn.type = btn.type === 'password' ? 'text' : 'password';
    lock.src = btn.type === 'password' ? closedLock : openedLock;
}
