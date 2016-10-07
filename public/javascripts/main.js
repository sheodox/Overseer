var list = document.querySelector('#groups'),
    socket = io();

socket.on('reconnect', () => {location.reload();});
socket.on('states', states => {
    list.innerHTML = '';
    states.forEach(s => {
        var li = document.createElement('li'),
            button = document.createElement('button');

        button.textContent = (s.on ? '☑' : '☐') + s.name;
        button.groupId = s.id;
        
        li.appendChild(button);
        list.appendChild(li);
    });
});

list.addEventListener('click', e => {
    socket.emit('toggle', e.target.groupId);
});