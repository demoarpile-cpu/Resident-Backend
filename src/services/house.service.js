import prisma from '../config/prisma.js';

export const getAllHouses = async () => {
  return await prisma.house.findMany({
    include: {
      _count: {
        select: { residents: true }
      }
    }
  });
};

export const createHouse = async (data) => {
  return await prisma.house.create({
    data: {
      name: data.name,
      type: data.type,
      status: data.status || 'Vacant'
    }
  });
};

export const updateHouse = async (id, data) => {
  return await prisma.house.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      status: data.status
    }
  });
};

export const deleteHouse = async (id) => {
  return await prisma.house.delete({
    where: { id }
  });
};
