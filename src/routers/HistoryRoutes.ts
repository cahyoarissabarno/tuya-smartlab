import HistoryController from "../controllers/HistoryController";
import BaseRoutes from "./BaseRoutes";

class HistoryRoutes extends BaseRoutes{
    
    routes(): void {
        this.router.post('/', HistoryController.read);
        this.router.post('/date', HistoryController.readByDate);
        this.router.post('/block', HistoryController.block);
    }
    
}

export default new HistoryRoutes().router;