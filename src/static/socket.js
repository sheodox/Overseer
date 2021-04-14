import {io} from 'socket.io-client';
import {createAutoExpireToast} from 'sheodox-ui';
import {Envoy} from "../shared/envoy";

export const socket = io();

const toastEnvoy = new Envoy(socket, 'toasts');

toastEnvoy.on({
    toast: (toastOptions) => {
        createAutoExpireToast(toastOptions);
    }
});

