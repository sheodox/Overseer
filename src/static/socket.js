import {io} from 'socket.io-client';
import {createAutoExpireToast} from 'sheodox-ui';
import {Conduit} from "../shared/conduit";

export const socket = io();

const notificationConduit = new Conduit(socket, 'notifications');

notificationConduit.on({
    notification: (toastOptions) => {
        createAutoExpireToast(toastOptions);
    }
});

