import { NextFunction, Request, Response } from "express";
import { requestHandler } from "../utils/RequestHandler";
import { TuyaRequest } from "../utils/TuyaHelper";
import { IDeviceController } from "./ControllerInterface";
import { config as dotenv } from "dotenv";
import ErrorHandler from "../utils/ErrorHandler";

dotenv();

class DeviceController implements IDeviceController {

    command = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        console.log(req.body)
        try {
            const data = req.body;
            const { deviceId } = req.params;

            const path = process.env.TUYA_VERSION_API + `/iot-03/devices/${deviceId}/commands`;
            // send to tuya cloud API
            const command = await TuyaRequest("POST", path, {
                "commands": JSON.parse(data.commands)
            });

            if(!command.success){
               throw new ErrorHandler(command.msg as string, command.code, false);
            }
            return res.status(200).send(requestHandler(command, "Succeed send command to device!", 200));
        } catch (e) {
            return next(e);
        }
    }

    // should subscribe extension API
    showAllDevices = async (req: Request, res: Response): Promise<Response> => {
        const { projectId } = req.params;
        const { page, perPage } = req.query;

        try {
            const resp = await TuyaRequest("GET", process.env.TUYA_VERSION_API + `/expand/devices?projectId=${projectId}&pageNo=${page}&pageSize=${perPage}`);
            return res.send(requestHandler(resp, "Success get device list!", 200));
        } catch (e) {
            return res.send(requestHandler(e, "Failed get device list!", 200));
        }
    }

}

export default new DeviceController();