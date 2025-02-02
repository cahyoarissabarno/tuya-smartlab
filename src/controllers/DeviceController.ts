import { NextFunction, Request, Response } from "express";
import { requestHandler } from "../utils/RequestHandler";
import { TuyaRequest } from "../utils/TuyaHelper";
import { IDeviceController } from "./ControllerInterface";
import { config as dotenv } from "dotenv";
import ErrorHandler from "../utils/ErrorHandler";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../constant/ErrorType";
import { Op } from "sequelize";
import axios from "axios";
import room from "../models/room";
const Device = require('../models').Device;
const Room = require('../models').Room;
const History = require('../models').History;
const User = require('../models').User;
const UserDevice = require('../models').UserDevice;
const Block = require('../models').Block;


dotenv();

class DeviceController implements IDeviceController {

    command = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            // testing variables
            let start_all = 0
            let start_db = 0
            let start_ty = 0
            let start_bc = 0
            let end_bc = 0
            let end_ty = 0
            let end_db = 0
            let end_all = 0

            start_all = Date.now()

            const data = req.body;
            const { deviceCode } = req.params;
            // const { credentials } = req.app.locals;
            // console.log(data)
            // const findDeviceById = await Device.findOne({ where: { user_id: credentials.id } });

            start_db = Date.now()
            
            const findDevice = await Device.findOne({
                where: { device_code: deviceCode },
                include: [{ model: Room , as: 'room'}]
            });

            // console.log(device.dataValues)
            // res.status(200).send(device)

            if (findDevice) {
                end_db = Date.now()
                start_ty = Date.now()

                const path = process.env.TUYA_VERSION_API + `/iot-03/devices/${deviceCode}/commands`;
                const commands = await TuyaRequest("POST", path, data);
                
                console.log("com: ",commands)
                end_ty = Date.now()
                
                const payload = {
                    date: new Date().getTime(),
                    user_id: 1,
                    // device_id: deviceCode,
                    from: findDevice.dataValues.room.address,
                    device_id: findDevice.dataValues.id,
                    // status: 1,
                    message: data
                }

                console.log(payload)
                start_bc = Date.now()

                if (commands.success) {
                    // axios.post('http://10.0.2.7:8181/device', payload)
                    axios.post('http://10.0.2.7:8181/device-test', payload)
                    // axios.post('http://localhost:8080/device-test', payload)
                    .then(async function (response) {
                        end_bc=Date.now()
                        end_all=Date.now()
                        console.log(response.data);

                        //store block number to db
                        await Block.create({
                            block_number: response.data.blockNumber,
                            date: payload.date,
                            device_id: payload.device_id
                        });

                        res.status(200).send(requestHandler({
                            commands,
                            // ms: new Date().getMilliseconds,
                            // minute: new Date().getMinutes,
                            // hours: new Date().getHours,
                            // date: new Date(),
                            requestTime: {
                                all: `${end_all-start_all} ms`,
                                db: `${end_db-start_db} ms`,
                                ty:`${end_ty-start_ty} ms`,
                                bc:`${end_bc-start_bc} ms`,
                                nobc:`${(end_all-start_all)-(end_bc-start_bc)} ms`
                                // raw:{start_all, start_bc, start_db, start_ty, end_all, end_bc, end_db, end_ty}
                            }
                            // historyDevice
                        }, "Succeed send command and record device", 200))
                        // }, response.data, 200));
                    })
                    .catch(function (error) {
                        console.log(error);
                        res.status(500).send(error);
                    });
                } else {
                    res.status(500).send(commands.msg);
                }
                
            }else{
                const path = process.env.TUYA_VERSION_API + `/iot-03/devices/${deviceCode}/commands`;
                // send to tuya cloud API
                const commands = await TuyaRequest("POST", path, data);
                console.log("com: ",commands)
                console.log("suc: ",commands.success)
                if (commands.success) {
                    res.status(200).send(requestHandler({
                        commands,
                        requestTime: {
                            all: `${end_all-start_all} ms`,
                            db: `${end_db-start_db} ms`,
                            ty:`${end_ty-start_ty} ms`,
                            bc:`${end_bc-start_bc} ms`
                        }
                    }, "Succeed send command only, history not saved to the blockchain", 200))
                } else {
                    res.status(500).send(commands.msg);
                }
                // throw new ErrorHandler(`Device with this code (${deviceCode}) is not found`, NOT_FOUND, false);
            }

        } catch (e) {
            const data = req.body;
            const { deviceCode } = req.params;
            const path = process.env.TUYA_VERSION_API + `/iot-03/devices/${deviceCode}/commands`;
            
            // send to tuya cloud API
            const commands = await TuyaRequest("POST", path, data);
            console.log("com: ",commands)
            console.log("suc: ",commands.success)

            if (commands.success) {
                res.status(200).send(requestHandler({
                    commands
                }, "Succeed send command only, history not saved to the blockchain", 200))
            } else {
                res.status(500).send(commands.msg);
                // throw new ErrorHandler(commands.msg as string, commands.code, false);
            }

            // return res.status(500).send((e as Error));
        }
    }

    command2 = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            let start_all = 0
            let end_all = 0
            const data = req.body;
            const { deviceCode } = req.params;
            start_all= Date.now()
            console.log(data)
            const path = process.env.TUYA_VERSION_API + `/iot-03/devices/${deviceCode}/commands`;
    //         // send to tuya cloud API
            const commands = await TuyaRequest("POST", path, data);
            console.log("com: ",commands)
            end_all=Date.now()
            res.status(200).send(requestHandler({
                commands,
                // ms: new Date().getMilliseconds,
                // minute: new Date().getMinutes,
                // hours: new Date().getHours,
                date: new Date(),
                requestTime: {
                    all: `${end_all-start_all} ms`,
                    raw:{start_all, end_all}
                }
                // historyDevice
            }, "Succeed send command only", 200));
            // throw new ErrorHandler(`Device with this code (${deviceCode}) is not found`, NOT_FOUND, false);
            
        } catch (e) {
            return res.status(500).send((e as Error));;
        }
    }

    status = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { deviceCode } = req.params;

            const path = process.env.TUYA_VERSION_API + `/iot-03/devices/${deviceCode}/status`;
            // send to tuya cloud API
            const command = await TuyaRequest("GET", path);
            if (!command.success) {
                throw new ErrorHandler(command.msg as string, command.code, false);
            }
            res.status(200).send(requestHandler(command, `Success get this device (${deviceCode}) status`, 200));
        } catch (e) {
            res.status(500).send((e as Error));
        }
    }
    create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { device_code, device_name, device_type, room_id, user_id } = req.body;
            // const { credentials } = req.app.locals;

            // const findDevice = await Device.findOne({ where: { device_code , user_id: credentials.id, room_id } });
            const findDevice = await Device.findOne({ where: { device_code: device_code } });
            // const findDevice = false
            // console.log(req.body)
            if (!findDevice) {
                // res.status(200).send("device not found");
                const device = await Device.create({
                    device_code,
                    user_id,
                    device_name, 
                    device_type,
                    room_id
                    // status: false
                });
                // console.log(device)

                if (!device) {
                    throw new ErrorHandler("Error when add device", INTERNAL_SERVER_ERROR, false);
                } 
                // else {
                //     const findUserWithDeviceId = await UserDevice.findOne({ where: { user_id: credentials.id, device_id: device.dataValues.id } });
                //     if (findUserWithDeviceId) {
                //         throw new ErrorHandler("Cannot add device to this user, device has already added to this user", INTERNAL_SERVER_ERROR, false);
                //     } else {
                //         const userDevice = await UserDevice.create({ user_id: credentials.id, device_id: device.dataValues.id });
                //         if (!userDevice) {
                //             throw new ErrorHandler("Cannot add device to this user", INTERNAL_SERVER_ERROR, false);
                //         }
                res.status(200).send("Success to add the device to this user");
                //     }
                // }
            } else {
                // res.status(200).send("device found");
                // const findRoom = await Device.findOne({ where: { id: room_id } });
                throw new ErrorHandler("Device is already registered in other room", INTERNAL_SERVER_ERROR, false);
            }
        } catch (e) {
            // res.status(500).send((e as Error));;
            res.status(500).send((e as Error));
        }
    }
    read = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            // const { credentials } = req.app.locals;

            const device = await Device.findAll(
                // {
                //     where: { user_id: credentials.id },
                // }
            )

            if (!device) {
                throw new ErrorHandler("Cannot get devices", INTERNAL_SERVER_ERROR, false);
            }
            return res.send(requestHandler(device, "Succeed get all device data", 200))
        } catch (e) {
            res.status(500).send((e as Error));
        }
    }
    readById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            // const { credentials } = req.app.locals;
            const { deviceCode } = req.params;
            const device = await Device.findOne({ where: { device_code: deviceCode }})

            if (!device) {
                throw new ErrorHandler("Cannot get device data", INTERNAL_SERVER_ERROR, false);
            } else {
                return res.send(requestHandler(device, "Succeed get device data", 200))
            }
        } catch (e) {
            res.status(500).send((e as Error));
        }
    }
    readByRoomId = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            // const { credentials } = req.app.locals;
            const { room_id } = req.params;
            const device = await Device.findAll({ where: { room_id }})

            if (!device) {
                throw new ErrorHandler("Cannot get device data", INTERNAL_SERVER_ERROR, false);
            }
            return res.send(requestHandler(device, "Succeed get device data on this room", 200))
        } catch (e) {
            res.status(500).send((e as Error));
        }
    }
    delete = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { id } = req.params;
            // const { credentials } = req.app.locals;
            const findDevice = await Device.findOne({
                where: {
                    id: id,
                    // user_id: credentials.id,
                }
            })

            if (findDevice) {
                console.log(findDevice)
                const device = await Device.destroy({
                    where: {
                        id: id,
                        // user_id: credentials.id,
                    }
                });

                if (!device) {
                    throw new ErrorHandler("Error when delete device", INTERNAL_SERVER_ERROR, false);
                } 
                // else {
                //     const userDevice = await UserDevice.destroy({ where: { user_id: credentials.id, device_id: findDevice.dataValues.id } });
                //     if (!userDevice) {
                //         throw new ErrorHandler("Something error when delete this device from this user", NOT_FOUND, false);
                //     }
                res.status(200).send("Success to delete the device");
                // }
            } else {
                throw new ErrorHandler("Device is not found", NOT_FOUND, false);
            }
        } catch (e) {
            res.status(500).send((e as Error));
            // throw new ErrorHandler("Device is not found", NOT_FOUND, false);
        }
    }
    update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { id } = req.params;
            const { device_code, user_id, device_name, device_type, room_id } = req.body;

            const device = await Device.findOne({ where: { id } });
            console.log(device)
            if (!device) {
                throw new ErrorHandler("Error when update device", INTERNAL_SERVER_ERROR, false);
            } else {
                // device.status = status;
                // device.device_id = device_id;
                device.device_code = device_code ? device_code : device.device_code;
                // device.user_id = user_id ? user_id : device.user_id;
                device.device_name = device_name ? device_name : device.device_name;
                device.device_type = device_type ? device_type : device.device_type;
                device.room_id = room_id ? room_id : device.room_id;

                await device.save();
                return res.status(200).send(requestHandler(device, "Succeed update device data", 200));
            }
        } catch (e) {
            res.status(500).send((e as Error));;
        }
    }
    // should subscribe extension API
    getRegisteredDeivceOnTuya = async (req: Request, res: Response): Promise<Response> => {
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
