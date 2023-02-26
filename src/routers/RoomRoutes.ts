import RoomController from "../controllers/RoomController";
import { auth } from "../middlewares/AuthMiddleware";
import BaseRoutes from "./BaseRoutes";

class RoleRoutes extends BaseRoutes {
    routes(): void {
        this.router.post('/', RoomController.create);
        this.router.put('/:id', RoomController.update);
        this.router.delete('/:id', RoomController.delete);
        this.router.get('/', RoomController.getAll);
        this.router.get('/:id', RoomController.getbById);
    }

}

export default new RoleRoutes().router;