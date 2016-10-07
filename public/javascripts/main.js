var list = document.querySelector('#groups'),
    socket = io();

socket.on('reconnect', () => {location.reload();});
socket.on('states', states => {
    list.innerHTML = '';
    states.forEach(s => {
        var li = document.createElement('li'),
            button = document.createElement('button');

        button.textContent = (s.on ? '☑' : '☐') + s.name;
        button.groupOn = s.on;
        button.groupId = s.id;
        
        li.appendChild(button);
        list.appendChild(li);
    });
});

list.addEventListener('click', e => {
    socket.emit('set', e.target.groupId, !e.target.groupOn);
});