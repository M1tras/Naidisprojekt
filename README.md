# Energy Monitoring and Advisory Dashboard

## Projekt

See projekt on lokaalne arenduskeskkond energiamonitooringu süsteemi jaoks.
Rakendus võimaldab backendil hallata andmebaasi ning frontendil kontrollida backendi töökorda.

---

## Tehniline stack

* Backend: Node.js + Express
* Andmebaas: MariaDB (MySQL)
* ORM: Sequelize
* Frontend: Plain HTML + JavaScript

---

## Käivitamine

### 1. Klooni repo

```bash
git clone <repo-url>
cd Naidisprojekt
```

---

### Backend seadistamine

```bash
cd Backend
npm install
```

---

### Andmebaas

Käivita MariaDB ja loo andmebaas:

```sql
CREATE DATABASE energy_db;

CREATE USER 'energy_user'@'localhost' IDENTIFIED BY 'test1234';
GRANT ALL PRIVILEGES ON energy_db.* TO 'energy_user'@'localhost';
FLUSH PRIVILEGES;
```

---

### Sequelize config

Fail: `Backend/config/config.json`

```json
{
  "development": {
    "username": "energy_user",
    "password": "test1234",
    "database": "energy_db",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

---

### Migratsioonid

```bash
npx sequelize-cli db:migrate
```

---

### Backend käivitamine

```bash
node index.js
```

Backend töötab aadressil:

```
http://localhost:3000
```

Health endpoint:

```
GET /api/health
```

Näide vastusest:

```json
{
  "status": "ok",
  "db": "ok"
}
```

---

### Frontend käivitamine

```bash
cd ../frontend
python3 -m http.server 5173
```

Ava brauseris:

```
http://localhost:5173
```

Frontend teeb päringu backendile ja kuvab staatuse.

---

## Funktsionaalsus

* Backend ↔ Database ühendus
* Health check endpoint
* Sequelize migratsioonid
* Frontend ↔ Backend suhtlus

---

## Oluline

* Frontend ei tee otsepäringuid välistele API-dele
* Kõik API päringud käivad läbi backendi
* `.gitignore` välistab `node_modules`

---

## Projekti struktuur

```
Backend/
  config/
  migrations/
  models/
  index.js

frontend/
  index.html
```

---

## Kasutaja

Tehniline energiamanager (mitte arendaja)

---

## Staatus

Moodul 1 valmis:

* Rakendus töötab lokaalselt
* Andmebaasi ühendus toimib
* Migratsioonid töötavad
* Frontend suhtleb backendiga
