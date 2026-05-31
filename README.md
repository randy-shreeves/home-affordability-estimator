# Home Affordability Estimator

A full-stack web application that estimates the maximum home price a buyer can afford based on their desired monthly payment.

Live link: https://home-affordability-estimator.vercel.app/

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Deployed on Vercel

### Backend

* Java
* Spring Boot
* Maven
* JUnit
* Deployed on AWS EC2 (Ubuntu)

## Architecture

* React frontend hosted on Vercel sends fetch request to DuckDNS domain
* DuckDNS domain maps to AWS EC2 instance public IP
* Nginx runs on EC2 instance and handles HTTPS termination using Let's Encrypt certificate
* Nginx forwards requests internally to Spring Boot app on port 8080

## Features

* Calculates maximum affordable home price
* Supports property taxes, homeowners insurance, PMI, and HOA fees
* Frontend input validation
* Backend request validation
* Unit tested with JUnit
* Deployed frontend & backend

## Running Locally

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```
