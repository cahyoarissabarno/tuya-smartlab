import DeviceController from "../controllers/DeviceController";
import { auth } from "../middlewares/AuthMiddleware";
import BaseRoutes from "./BaseRoutes";

class DeviceRouter extends BaseRoutes {
    routes(): void {
        // internal API extended with TUYA API
        this.router.post('/command/:deviceCode', DeviceController.command);
        this.router.post('/command2/:deviceCode', DeviceController.command2);
        this.router.get('/status/:deviceCode', DeviceController.status);
        this.router.get('get-all-device-tuya/:projectId', DeviceController.getRegisteredDeivceOnTuya);
        
        // internal API
        this.router.post('/create', DeviceController.create);
        this.router.get('/', DeviceController.read);
        this.router.get('/id/:deviceCode', DeviceController.readById);
        this.router.get('/room/:room_id', DeviceController.readByRoomId);
        this.router.put('/:deviceCode', DeviceController.update);
        this.router.delete('/:deviceCode', DeviceController.delete);
    }

}

export default new DeviceRouter().router;