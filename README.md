# The-Heisei

<details>
  <summary>The problem statement</summary>
In the face of natural disasters, a country's resilience is put to the test as various organizations and individuals, including the government, rush to provide resources such as food, water, medicine, clothing, and shelter equipment. While the outpouring of support is commendable, the lack of a centralized agency coordinating based on ground realities creates challenges. This often results in an excess of certain items, while crucial necessities may be lacking. Compounding the issue is the lack of electricity and mobile networks in disaster-stricken areas.

For instance, in a flood scenario, well-meaning donors may contribute perishable items like rice, even though the immediate need could be for clean drinking water or basic medicines to address common ailments like fever, stomach pain, and diarrhea. Unfortunately, the excess rice may spoil due to inadequate storage or remain unused.

In the era of increasing climate change-related events, the frequency of such disasters is rising. Recognizing the urgency of the situation, hackfest team invites participants to devise innovative solutions to address the following challenges:

Solving Supply-Demand Issues: Propose strategies to balance the supply of donated goods with the actual demand on the ground. Matching the Supply-Demand: Develop systems or tools to efficiently match available resources with the specific needs of affected areas. Validating Requirements: Create mechanisms to validate and verify the actual requirements, ensuring that donations align with the most pressing needs. Broadcasting Requirements: Devise methods to effectively broadcast the identified needs to potential donors, taking into account the challenges of limited electricity and mobile networks. Ensuring Timely Fulfillment: Implement solutions that facilitate the timely delivery of required resources to affected regions, minimizing delays and bottlenecks. Real-time Requirement Updates: Explore ideas for maintaining up-to-date information on evolving needs, allowing for dynamic adjustments to donation efforts.
</details>

-----

# Heisei: Streamlining Disaster Relief with Real-Time Coordination 🆘

A blockchain-powered platform designed to revolutionize disaster relief operations by enhancing **efficiency**, **transparency**, and **security** in resource allocation and supply chain management.
-----

## 💡 Project Overview

Traditional disaster response efforts are often hindered by poor coordination, a critical mismatch between supply and demand, and a general lack of transparency and accountability. The **Heisei** system addresses these persistent issues by integrating a custom **blockchain** with real-time tracking systems to ensure that the right resources are delivered to the right places at the right time.

### 🎯 Key Objectives

The primary goals of the Heisei system are to:

  * **Enhance Transparency:** Provide a tamper-proof record of all donations and transactions using blockchain technology, allowing donors to track their contributions in real-time and fostering trust.
  * **Optimize Resource Allocation:** Implement real-time inventory tracking and demand-based requests to prevent resource shortages or surpluses in affected areas.
  * **Improve Coordination:** Offer an integrated platform for seamless communication and optimized task assignment between donors, volunteers, and relief organizations.
  * **Ensure Data Security:** Utilize **HeiseiChain**, an in-house blockchain framework, along with **bcrypt** hashing and **RSA encryption** to safeguard all user authentication and transaction data.

-----

## ✨ Features & Solution

The Heisei system streamlines the entire disaster relief supply chain through the following core features:

1.  **Blockchain-Powered Supply Chain:** All donation and resource distribution events are recorded on **HeiseiChain**, an immutable and verifiable ledger, providing a complete audit trail.
2.  **Real-Time Inventory Management:** Relief camps can dynamically update their stock levels and issue precise resource requests based on actual needs, helping to match supply with demand instantly.
3.  **Secure Donor Tracking:** Donors gain visibility into how their contributions are utilized, from dispatch to final delivery confirmation.
4.  **Volunteer Optimization:** The platform facilitates the efficient transport of donations by matching donors and volunteers based on proximity and availability.
5.  **Robust Access Control:** **Role-Based Access Control (RBAC)** ensures that only authorized personnel can modify critical data and transaction details, enhancing system integrity.

-----

## 💻 Technology Stack

Heisei is built on a robust, multi-layered architecture utilizing open-source technologies:

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | **Node.js** and **Express.js** | Handles API requests, transaction processing, and system logic. |
| **Frontend** | **HTML**, **CSS**, **Express.js** | Provides a responsive, accessible, and interactive user interface (UI) for all stakeholders. |
| **Database** | **SQL-based Storage** | Manages inventory data, user profiles, and off-chain records. |
| **Blockchain** | **HeiseiChain** (Custom) | A custom-built, lightweight blockchain framework for decentralized, tamper-proof record-keeping of resource flow. |
| **Security** | **Bcrypt** & **RSA** | **Bcrypt** for secure password hashing; **RSA** for secure data transmission. |

-----
## Architecture Diagram

![arch diagram](Img/Heise%20architecture%20diagrm.png)


-----

## 🛠️ Setup and Installation

### Prerequisites

You will need the following software installed on your machine:

  * **Node.js** (LTS recommended)
  * A **SQL Database** (e.g., MySQL or PostgreSQL)
  * A code editor (e.g., VS Code)

### Step-by-Step Guide

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/Akash-vadakkeveetil/The-Heisei.git
    cd The-Heisei
    ```

2.  **Install Dependencies:**

    ```bash
    # Install Node.js dependencies for the backend and frontend modules
    npm install
    ```

3.  **Database Setup:**

      * Set up your chosen SQL database.
      * Configure the connection string and environment variables as per the backend requirements (check the project files for configuration details).

4.  **Run the Application:**

    ```bash
    # Start the Node.js/Express.js server
    npm start
    ```

    The application should now be running locally and accessible via your web browser.

---

## ⚖️ License

*This project is likely licensed under an educational or open-source license. Please consult the repository for the specific license file.*