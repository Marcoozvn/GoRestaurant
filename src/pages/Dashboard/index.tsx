import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get<IFoodPlate[]>('foods');

      setFoods(response.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const response = await api.post('foods', { ...food, available: true });

      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const newFood = { ...editingFood, ...food };

    const response = await api.put<IFoodPlate>(`/foods/${newFood.id}`, newFood);

    const newArray = foods.map(item => {
      if (item.id === response.data.id) {
        return response.data;
      }
      return item;
    });

    setFoods(newArray);
    setEditingFood({} as IFoodPlate);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`foods/${id}`);

    const newArray = foods.filter(item => item.id !== id);

    setFoods(newArray);
  }

  function toggleModal(): void {
    setModalOpen(value => !value);
  }

  function toggleEditModal(): void {
    setEditModalOpen(value => !value);
  }

  async function handleChangeAvailability(food: IFoodPlate): Promise<void> {
    const response = await api.put(`/foods/${food.id}`, food);

    const newArray = foods.map(item => {
      if (item.id === response.data.id) {
        return response.data;
      }
      return item;
    });

    setFoods(newArray);
  }

  function handleEditFood(food: IFoodPlate): void {
    const [editing] = foods.filter(item => item.id === food.id);
    setEditingFood(editing);

    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleChangeAvailability={handleChangeAvailability}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
