
export interface BridgeTelemetry {
    gamma: number;
    phi: number;
    score: number;
    nodes?: any[];
}

export class QuantumBridge {
    private static instance: QuantumBridge;
    private activeConnections: Set<MessageEventSource> = new Set();

    private constructor() {
        window.addEventListener('message', this.handleMessage.bind(this));
    }

    public static getInstance(): QuantumBridge {
        if (!QuantumBridge.instance) {
            QuantumBridge.instance = new QuantumBridge();
        }
        return QuantumBridge.instance;
    }

    private handleMessage(event: MessageEvent) {
        // API compatible con Apps de Terceros (Extensiones)
        if (event.data?.type === 'RQNT_DATA_REQUEST') {
            if (event.source) {
                this.activeConnections.add(event.source);
                console.log('RQNT: Sincronización de extensión externa establecida.');
            }
        }
    }

    public broadcast(payload: BridgeTelemetry) {
        this.activeConnections.forEach(source => {
            try {
                (source as Window).postMessage({
                    type: 'RQNT_TELEMETRY_DATA',
                    payload,
                    origin: 'ABC_SIMULATOR_CORE'
                }, '*');
            } catch (e) {
                this.activeConnections.delete(source);
            }
        });
    }

    // Sistema de Exportación .sip (Simulated Information Protocol)
    public exportSIP(state: any) {
        const data = {
            version: "3.0",
            timestamp: Date.now(),
            payload: state,
            signature: "ABC_EQUILIBRIUM_" + Math.random().toString(36).substr(2, 9)
        };
        const blob = new Blob([btoa(JSON.stringify(data))], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ABC_DATA_${new Date().toISOString().split('T')[0]}.sip`;
        link.click();
        URL.revokeObjectURL(url);
    }

    public get connectionCount(): number {
        return this.activeConnections.size;
    }
}
