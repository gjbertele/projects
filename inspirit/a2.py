
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Activation, Dropout, Flatten, Dense
from tensorflow.keras import optimizers

perceptron = Sequential()
perceptron.add(Flatten(input_shape = (1)))
perceptron.add(Dense(units = 5, activation='linear'))
perceptron.add(Dense(units = 1, activation='linear'))
perceptron.compile(loss='mean_squared_error',optimizer=optimizers.SGD(learning_rate=1e-3,momentum=0.9),metrics=['accuracy'])
monitor = ModelCheckpoint('./model.h5', monitor='val_loss', verbose=0, save_best_only=True, save_weights_only=False, mode='auto', save_freq='epoch')
history = perceptron.fit(np.arange(0,100,5), np.arange(0,200,10), epochs=10, validation_data = (np.arange(2,102,5),np.arange(4,104,10)), shuffle=True, callbacks = [monitor])
