import pandas as pd
import pickle
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "dataset" / "Solar Power Plant Data.csv"
MODEL_PATH = BASE_DIR / "model" / "model.pkl"

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.ensemble import RandomForestRegressor

data = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully!")
print("Dataset shape:", data.shape)

data['Date-Hour(NMT)']=pd.to_datetime(data['Date-Hour(NMT)'], format="%d.%m.%Y-%H:%M")

data["Hour"] = data["Date-Hour(NMT)"].dt.hour
data["Month"] = data["Date-Hour(NMT)"].dt.month
data["Year"] = data["Date-Hour(NMT)"].dt.year
data["Day"] = data["Date-Hour(NMT)"].dt.day
data["Week"] = data["Date-Hour(NMT)"].dt.isocalendar().week.astype(int)

def day_or_not(hour):
    if hour<6 or hour>19:
      return 'night'
    else:
      return 'day'
    
data['Day/Night']=data['Hour'].apply(day_or_not)

data['Radiation_Norm']=data['Radiation']/data['Radiation'].max()

data['Radiation_Cum']=data.groupby('Day')['Radiation'].cumsum()

data.drop(columns=['Date-Hour(NMT)'],inplace=True)

x=data.drop(columns=['SystemProduction'])
y=data['SystemProduction']

x_train,x_test,y_train,y_test=train_test_split(x,y,random_state=42,test_size=0.2)

trf=ColumnTransformer([
    ('scale',StandardScaler(),['WindSpeed', 'Sunshine', 'AirPressure', 'Radiation', 'AirTemperature',
       'RelativeAirHumidity','Hour', 'Month', 'Year',
       'Day', 'Week', 'Radiation_Norm', 'Radiation_Cum']),
    ('ohe',OneHotEncoder(handle_unknown='ignore'),['Day/Night'])
],remainder='passthrough')

pipe_rf=Pipeline([
    ('trf',trf),
    ('rf',RandomForestRegressor())
])

pipe_rf.fit(x_train,y_train)

y_pred = pipe_rf.predict(x_test)

r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)


print("\nModel Performance")
print("-----------------")
print("R2 Score:", r2)
print("MAE:", mae)

with open(MODEL_PATH, "wb") as file:
    pickle.dump(pipe_rf, file)

print("\nModel saved successfully!")
print("File:", MODEL_PATH)