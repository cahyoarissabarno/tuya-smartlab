import { NextFunction, Request, Response } from "express";
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from "../constant/ErrorType";
import ErrorHandler from "../utils/ErrorHandler";
import { getVanityWallet } from "../utils/vanity"; 
import { requestHandler } from "../utils/RequestHandler";
import axios from "axios";
const Room = require('../models').Room;
// const User = require('../models').User;


class RoomController {
    create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            axios.get('http://10.0.2.7:8181/address')
            .then(async(result) => {
                // console.log(result)
                const { room_name, room_desc } = req.body;
                const data = result.data.addr;
                const room = await Room.create({ room_name, room_desc, address: data.address });
                if (!room) {
                    throw new ErrorHandler("Cannot save room to db", INTERNAL_SERVER_ERROR, false);
                } 
                res.send(requestHandler(room, "Success creating a room", 200));
                // res.status(200).send(result.data);
            }).catch((err) => {
                res.status(500).send((err as Error));
            });
            
            // const { room_name, room_desc, address } = req.body;
            // const room = await Room.create({ room_name, room_desc, address });
            // if (!room) {
            //     throw new ErrorHandler("Cannot create room", INTERNAL_SERVER_ERROR, false);
            // }
            // return res.send(requestHandler(room, "Success creating a room", 200));

            
        } catch (e) {
            console.log(e)
            res.status(500).send((e as Error));
        }
    }

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const room = await Room.findAll({
                // include: [{
                //     model: User,
                //     as: 'room'
                // }]
            });
            if (!room) {
                throw new ErrorHandler("There is no room in database", INTERNAL_SERVER_ERROR, false);
            }
            return res.send(requestHandler(room, "Success get a room", 200));
        } catch (e) {
            res.status(500).send((e as Error));
        }
    }

    //get by id
    getbById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { id } = req.params;
            const room = await Room.findOne({ where: { id }});
            if (!room) {
                throw new ErrorHandler("There is no room in database", INTERNAL_SERVER_ERROR, false);
            }
            return res.send(requestHandler(room, "Success get a room", 200));
        } catch (e) {
            res.status(500).send((e as Error));
        }
    }

    update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { id } = req.params;
            const { new_name, new_address } = req.body;
            const room = await Room.findOne({ where: { id } });
            if (!room) {
                throw new ErrorHandler("Cannot update room", INTERNAL_SERVER_ERROR, false);
            } else {
                if (!new_name && !new_address) {
                    throw new ErrorHandler("Please input new name or new address", INTERNAL_SERVER_ERROR, false);   
                } else {
                    // console.log({id, new_name, new_address})
                    room.room_name = new_name ? new_name : room.room_name;
                    room.address = new_address ? new_address : room.address;
                    // console.log(room)
                    await room.save();
                    return res.send(requestHandler(room, "Success update a room", 200));
                }
            }
        } catch (e) {
            res.status(500).send((e as Error));
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { id } = req.params;
            const findRoom = await Room.findOne({ where: { id } });

            if (findRoom) {
                const deleteRoom = await Room.destroy({
                    where: { id }
                });

                if (!deleteRoom) {
                    throw new ErrorHandler("Error when delete room", INTERNAL_SERVER_ERROR, false);
                } else {
                    res.status(200).send("Success to delete the device from this user");
                }
            } else {
                throw new ErrorHandler("Device is not found from this user", NOT_FOUND, false);
            }
        } catch (e) {
            res.status(500).send((e as Error));
        }
    }
}

export default new RoomController();