//http://localhost:5000/login.html
//https://localhost/phpmyadmin/
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const mysql2 = require('mysql2/promise');
const ejs = require('ejs');
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const axios = require('axios');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
require('dotenv').config();
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

//ejs connection
app.set('view engine', 'ejs');
app.set("views",path.resolve("./views"));
//middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(cors());
puppeteer.use(StealthPlugin());

// Listen on environment port or 5000
app.listen(port, () => { console.log(`Server listening on port ${port}`); fetchglobalDurationParameter(); userRegistrationBlockchain(); }); 

// MySQL
const pool = mysql.createPool({
    connectionLimit: 10000,
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: 'heisei1'
});

//variables
let globalDurationParameter; //increase by admin if emergency(never be equal to or less than 1)
// Function to execute the query for globalDurationParameter
const fetchglobalDurationParameter = () => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection error:', err.message);
            return;
        }

        const query = 'SELECT globalDurationParameter FROM admininfo'; // Example query
        connection.query(query, (err, results) => {
            connection.release();
            if (err) {
                console.error('Query execution error:', err.message);
                return;
            }

            if (results.length > 0) {
                globalDurationParameter = results[0].globalDurationParameter; // Store the result in the global variable
                console.log('Global Duration Parameter:', globalDurationParameter);
            } else {
                console.log('No data found');
            }
        });
    });
};
//////////////////////////////

// Handle POST request for forgot/change username/password//////////////////////////////////////////////////////
// API to send Username & OTP
app.post('/send-username-otp', async (req, res) => {
    let email = req.body.email;
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            return res.status(500).send('Internal Server Error');
        }

        const query1 = 'SELECT username FROM login WHERE email=?';
        connection.query(query1, [email], async (error, results) => {
            connection.release(); // Release the connection after query execution
            
            if (error) {
                console.error('Error executing query: ' + error.message);
                return res.status(500).send('Internal Server Error');
            }

            if (results.length < 1) {
                return res.json({ success: false, message: 'Email Not Linked' });
            }

            const username = results[0].username;
            const subject = 'Your Username & OTP';
            const message = `From Team HEISEI,<br>Username: ${username}<br>Your OTP code to change password is ${otp}. It will expire in 3 minutes...`;

            try {
                await sendTutanotaEmail(email, subject, message);
                res.json({ success: true, otp });
            } catch (error) {
                console.error('Failed to send OTP:', error);
                res.json({ success: false, message: 'Failed to send OTP' });
            }
        });
    });
});
//handle forgot/change password form
app.post('/forgotform', (req, res) => {
    let { email, password } = req.body;
    let hashPassword;
    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            return res.status(500).send('Internal Server Error');
        }
            try {
                const Result = await new Promise((resolve, reject) => {
                    const saltRounds = 10;
                    bcrypt.hash(password,bcrypt.genSaltSync(saltRounds), (err, hashedPassword) => {
                        if (err) {
                            console.error('Error hashing password:', err);
                            return;
                        } else{
                            hashPassword=hashedPassword;
                        }
                
                        const query = 'UPDATE login set password=? where email=?';
                        connection.query(query, [hashPassword,email], (error, results) => {   
                            if (error) {
                                reject(error);
                                console.error('Error executing query: ' + error.message);
                                res.status(500).send('Internal Server Error');
                                return;
                            } else{
                                resolve(results);
                            }
                        });
                    });
                });
            } catch (err) {
                console.error('Error password changing:', err);
                return res.status(500).send('Internal Server Error');
            } finally {
                connection.release();
                res.redirect(`/login.html?alert=Password Changed Successfully!`);
            }
    });
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////

// Handle POST request for signup//////////////////////////////////////////////////////
// Function to send an email using Puppeteer
async function sendTutanotaEmail(to, subject, message) {
    // const browser = await puppeteer.launch({ headless: false });
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://mail.tutanota.com', { waitUntil: 'networkidle2' });

    // Wait for the email input field
    await page.waitForSelector('input[data-testid="tf:mailAddress_label"]', { visible: true });
    await page.type('input[data-testid="tf:mailAddress_label"]', 'forwardformation44@tutamail.com');
    // Wait for the password input field
    await page.waitForSelector('input[data-testid="tf:password_label"]', { visible: true });
    await page.type('input[data-testid="tf:password_label"]', 'Forward44@tut');
    // Click the login button (adjust if needed)
    await page.keyboard.press('Enter');
    // Wait for inbox to load
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("Logged in tuta successfully!");

   // Click the "New Email" button
   await page.waitForSelector('button[data-testid="btn:newMail_action"]', { visible: true });
   await page.click('button[data-testid="btn:newMail_action"]');
   console.log("Compose email window opened!");

    // Wait for "To" field and enter recipient email
    await page.waitForSelector('input[data-testid="tf:to_label"]', { visible: true });
    await page.evaluate((To) => {
        const inputField = document.querySelector('input[data-testid="tf:to_label"]');
        if (inputField) {
            inputField.value = ''; // Clear any existing value
            inputField.value = `${To}`; // Set the full email
            inputField.dispatchEvent(new Event('input', { bubbles: true })); // Trigger input event
        }
    },to);

     // Wait for "Subject" field and enter subject
     await page.waitForSelector('input[data-testid="tf:subject_label"]', { visible: true });
     await page.evaluate((sub) => {
        const inputField1 = document.querySelector('input[data-testid="tf:subject_label"]');
        if (inputField1) {
            inputField1.value = ''; // Clear any existing value
            inputField1.value = `${sub}`; // Set the full email
            inputField1.dispatchEvent(new Event('input', { bubbles: true })); // Trigger input event
        }
    },subject);

    // Enter message body
    await page.waitForSelector('div[data-testid="text_editor"]', { visible: true });
    await page.evaluate((msg) => {
        const messageBox = document.querySelector('div[data-testid="text_editor"]');
        messageBox.innerHTML = `<div dir="auto">${msg}</div>`;
    }, message);
    console.log("Email content added!");

    // Send Email
    await page.waitForSelector('button[data-testid="btn:send_action"]', { visible: true });
    await page.click('button[data-testid="btn:send_action"]');
    console.log("Email send!");

    //await browser.close();
}
// API to send OTP
app.post('/send-otp', async (req, res) => {
    let email = req.body.email;
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            return res.status(500).send('Internal Server Error');
        }

        const query1 = 'SELECT username FROM login WHERE email=?';
        connection.query(query1, [email], async (error, results) => {
            connection.release(); // Release the connection after query execution
            
            if (error) {
                console.error('Error executing query: ' + error.message);
                return res.status(500).send('Internal Server Error');
            }

            if (results.length >= 1) {
                return res.json({ success: false, message: 'Email already used' });
            }

            const subject = 'Your OTP Code';
            const message = `Welcome to HEISEI : Revolutionizing Resource Supply!<br>Your OTP code is ${otp}. It will expire in 3 minutes...`;

            try {
                await sendTutanotaEmail(email, subject, message);
                res.json({ success: true, otp });
            } catch (error) {
                console.error('Failed to send OTP:', error);
                res.json({ success: false, message: 'Failed to send OTP' });
            }
        });
    });
});
//handle signup form
app.post('/signup', async(req, res) => {
    let hashPassword;
    const { username, email, password, category } = req.body;
    let usernameconst1=req.body.username;

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        try{
        if(category=="volunteer" || category=="campcoordinator") {
            let adminDetails = await new Promise((resolve, reject) => {
                const query00 = `SELECT * from admin where email=? and category=?`;
                connection.query(query00,[email,category], (error, results) => {
                  if (error) reject(error);
                  else resolve(results);
                });
              });
            if(adminDetails.length<1){
                connection.release(); 
                return res.redirect(`/login.html?alert=Failed!\nNon Recognised E-mail, Contact Admin.`);
            }
        }

        const [Result] = await Promise.all([
        new Promise((resolve, reject) => {
    const saltRounds = 10;
    bcrypt.hash(password,bcrypt.genSaltSync(saltRounds), (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return;
        } else{
            hashPassword=hashedPassword;
        }
  
        const query = 'INSERT INTO login (username, email, password, category) VALUES (?, ?, ?, ?)';
        connection.query(query, [username, email, hashPassword, category], (error, results) => {   
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            } else{
                resolve(results);
            }
        });
        const data = { //88888888888888888888888888888888888
            username: username,
            role: category
          };
        axios.post('https://heiseichain.onrender.com/api/blockchain/register', null, { params: data })
        .then(response => console.log('Success:', response.data))
        .catch(error => console.error('Error:', error.response?.data || error.message));
    });
        })
        ]);
        if(req.body.category === 'campcoordinator')
            {   
                const [Result1] = await Promise.all([
                new Promise((resolve, reject) => {
                const query1 =   `CREATE TABLE IF NOT EXISTS ${usernameconst1+'list'} (
                    commodityno int(11) NOT NULL,
                    commodity varchar(255) NOT NULL,
                    unit varchar(255) NOT NULL,
                    stock int(11) NOT NULL,
                    additionrequired int(11) NOT NULL
                  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;
                  
                connection.query(query1, (error, results) => {
                    if (error) {
                        reject(error);
                      console.error('Error executing query: ' + error.message);
                      res.status(500).send('Internal Server Error');
                      return;
                    }else{
                        resolve(results);
                    }
                  });
                })
                ]);
                const query2 = `ALTER TABLE ${usernameconst1+'list'}
                ADD PRIMARY KEY (commodityno),
                ADD UNIQUE KEY commodity (commodity),
                ADD KEY commodityno (commodityno,commodity,unit);`;

                connection.query(query2, (error, results) => {
                    if (error) {
                      console.error('Error executing query: ' + error.message);
                      res.status(500).send('Internal Server Error');
                      return;
                    }
                  });
                
                const query3 = `ALTER TABLE ${usernameconst1+'list'} ADD CONSTRAINT FOREIGN KEY (commodityno,commodity,unit) REFERENCES commoditytable (commodityno, commodity, unit);`;
            
                connection.query(query3, (error, results) => {
                    if (error) {
                      console.error('Error executing query: ' + error.message);
                      res.status(500).send('Internal Server Error');
                      return;
                    }
                  });
                  const [Result2] = await Promise.all([
                    new Promise((resolve, reject) => {
                  const query4 = `CREATE TABLE ${usernameconst1} (
                    receiveno int(11) NOT NULL,
                    commodityno int(11) NOT NULL,
                    commodity varchar(255) NOT NULL,
                    quantity int(11) NOT NULL,
                    unit varchar(255) NOT NULL,
                    receivedfrom varchar(255) DEFAULT NULL,
                    date date NOT NULL,
                    status set('Not_available','Received') NOT NULL DEFAULT 'Not_available'
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;
            
                  connection.query(query4, (error, results) => {
                      if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                      }else{
                        resolve(results);
                      }
                    });
                    })
                    ]);
                    const query5 = `ALTER TABLE ${usernameconst1}
                    ADD PRIMARY KEY (receiveno),
                    ADD KEY commodityno (commodityno,commodity,unit),
                    ADD KEY receivedfrom (receivedfrom);`;
            
                    connection.query(query5, (error, results) => {
                        if (error) {
                          console.error('Error executing query: ' + error.message);
                          res.status(500).send('Internal Server Error');
                          return;
                        }
                      });

                      const query6 = `ALTER TABLE ${usernameconst1} MODIFY receiveno int(11) NOT NULL AUTO_INCREMENT;`;
              
                      connection.query(query6, (error, results) => {
                          if (error) {
                            console.error('Error executing query: ' + error.message);
                            res.status(500).send('Internal Server Error');
                            return;
                          }
                        });

                        const query7 = `ALTER TABLE ${usernameconst1}
                        ADD CONSTRAINT FOREIGN KEY (commodityno,commodity,unit) REFERENCES commoditytable (commodityno, commodity, unit),
                        ADD CONSTRAINT FOREIGN KEY (receivedfrom) REFERENCES login (username);`;
              
                        connection.query(query7, (error, results) => {
                            if (error) {
                              console.error('Error executing query: ' + error.message);
                              res.status(500).send('Internal Server Error');
                              return;
                            }
                          });
                          const query0 = 'INSERT INTO volcamp (username) VALUES (?)';
                          connection.query(query0, [username], (error, results) => {
                              if (error) {
                                  console.error('Error executing query: ' + error.message);
                                  res.status(500).send('Internal Server Error');
                                  return;
                              }
                            });
            }  
            else if(req.body.category === 'volunteer')
                {
                    const [Result3,Result4] = await Promise.all([
                    new Promise((resolve, reject) => {
                    const query1 =   `CREATE TABLE IF NOT EXISTS ${usernameconst1} (
                    receiveno int(11) NOT NULL,
                    commodityno int(11) NOT NULL,
                    commodity varchar(255) NOT NULL,
                    quantity int(11) NOT NULL,
                    unit varchar(255) NOT NULL,
                    receivedfrom varchar(255) DEFAULT NULL,
                    date date NOT NULL,
                    status set('Received','Not_available') NOT NULL DEFAULT 'Not_available'
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;
                      
                    connection.query(query1, (error, results) => {
                        if (error) {
                            reject(error);
                            console.error('Error executing query: ' + error.message);
                            res.status(500).send('Internal Server Error');
                            return;
                          }else{
                            resolve(results);
                          }
                      });
                    }),
                    new Promise((resolve, reject) => {
                        const query11 =   `CREATE TABLE ${usernameconst1+'stock'} (
                        commodityno int(11) NOT NULL,
                        commodity varchar(255) NOT NULL,
                        unit varchar(255) NOT NULL,
                        stock int(11) DEFAULT NULL
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`;
                          
                        connection.query(query11, (error, results) => {
                            if (error) {
                                reject(error);
                                console.error('Error executing query: ' + error.message);
                                res.status(500).send('Internal Server Error');
                                return;
                              }else{
                                resolve(results);
                              }
                          });
                        })
                    ]);
                    const query2 = `ALTER TABLE ${usernameconst1}
                    ADD PRIMARY KEY (receiveno),
                    ADD KEY commodityno (commodityno,commodity,unit),
                    ADD KEY receivedfrom (receivedfrom);`;
    
                    connection.query(query2, (error, results) => {
                        if (error) {
                          console.error('Error executing query: ' + error.message);
                          res.status(500).send('Internal Server Error');
                          return;
                        }
                      });
                    
                    const query3 = `ALTER TABLE ${usernameconst1} MODIFY receiveno int(11) NOT NULL AUTO_INCREMENT;`;
                
                    connection.query(query3, (error, results) => {
                        if (error) {
                          console.error('Error executing query: ' + error.message);
                          res.status(500).send('Internal Server Error');
                          return;
                        }
                      });

                      const query4 = `ALTER TABLE ${usernameconst1}
                        ADD CONSTRAINT FOREIGN KEY (commodityno,commodity,unit) REFERENCES commoditytable (commodityno, commodity, unit),
                        ADD CONSTRAINT FOREIGN KEY (receivedfrom) REFERENCES login (username);`;
                
                      connection.query(query4, (error, results) => {
                          if (error) {
                            console.error('Error executing query: ' + error.message);
                            res.status(500).send('Internal Server Error');
                            return;
                          }
                        });

                        const query5 = `ALTER TABLE ${usernameconst1+'stock'}
                        ADD PRIMARY KEY (commodityno),
                        ADD UNIQUE KEY commodity (commodity),
                        ADD KEY commodityno (commodityno,commodity,unit);`;
                
                      connection.query(query5, (error, results) => {
                          if (error) {
                            console.error('Error executing query: ' + error.message);
                            res.status(500).send('Internal Server Error');
                            return;
                          }
                        });                        

                        const query6 = `ALTER TABLE ${usernameconst1+'stock'}
                        ADD CONSTRAINT FOREIGN KEY (commodityno,commodity,unit) REFERENCES commoditytable (commodityno, commodity, unit) ON DELETE CASCADE ON UPDATE CASCADE;`;
                
                      connection.query(query6, (error, results) => {
                          if (error) {
                            console.error('Error executing query: ' + error.message);
                            res.status(500).send('Internal Server Error');
                            return;
                          }
                        });  

                        const query0 = 'INSERT INTO volcamp (username) VALUES (?)';
                        connection.query(query0, [username], (error, results) => {
                            if (error) {
                                console.error('Error executing query: ' + error.message);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                          });
                }  
        connection.release();
        res.redirect(`/login.html?alert=Successfully Signed Up!`);
    }catch(error){
        console.error('Unexpected error:', error);
        return res.status(500).send('Internal Server Error');
    }
    });
});
/////////////////////////////////////////////////////////////

// Handle POST request for login/////////////////////////////////////////////////////////////
const secretKey = crypto.randomBytes(64).toString('hex');
//console.log(secretKey);
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            return res.status(500).send('Internal Server Error');
        }

        async function verifyUser(username, password) {
            const sql = 'SELECT password, category FROM login WHERE username = ?';

            // Promisify the database query
            const queryAsync = (query, params) => {
                return new Promise((resolve, reject) => {
                    connection.query(query, params, (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });
            };

            try {
                const results = await queryAsync(sql, [username]);

                if (results.length > 0) {
                    const storedHash = results[0].password;

                    // Compare the provided plain-text password with the stored hash
                    const isMatch = await bcrypt.compare(password, storedHash);

                    if (isMatch) {
                        const category = results[0].category;
                        const token = jwt.sign({ username }, secretKey, { expiresIn: '24h' });

                        // Redirect based on user category
                        switch (category) {
                            case 'donor':
                                let results1 = await new Promise((resolve, reject) => {                       
                                    const query1 = 'SELECT blocked from donors where username=?';
                                    connection.query(query1, [username],async (error, results) => {
                                        if (error) {
                                            reject(error);
                                            console.error('Error executing query: ' + error.message);
                                            res.status(500).send('Internal Server Error');
                                            return;
                                        }else{
                                            resolve(results);
                                        }
                                    });
                                });
                                if(typeof results1[0] != "undefined"){
                                if(results1[0].blocked=="yes"){
                                    let alertMessage="User Blocked by Admin!\nContact Admin";
                                    return res.redirect(`login.html?alert=${encodeURIComponent(alertMessage)}`);
                                }
                                }
                                return res.redirect(`/donor-details?token=${token}`);
                            case 'volunteer':
                                let results2 = await new Promise((resolve, reject) => {                       
                                    const query1 = 'SELECT blocked from volunteers where username=?';
                                    connection.query(query1, [username],async (error, results) => {
                                        if (error) {
                                            reject(error);
                                            console.error('Error executing query: ' + error.message);
                                            res.status(500).send('Internal Server Error');
                                            return;
                                        }else{
                                            resolve(results);
                                        }
                                    });
                                });
                                if(typeof results2[0] != "undefined"){
                                if(results2[0].blocked=="yes"){
                                    let alertMessage="User Blocked by Admin!\nContact Admin";
                                    return res.redirect(`login.html?alert=${encodeURIComponent(alertMessage)}`);
                                }
                                }
                                return res.redirect(`/volunteer-details?token=${token}`);
                            case 'campcoordinator':
                                let results3 = await new Promise((resolve, reject) => {                       
                                    const query1 = 'SELECT blocked from camps where username=?';
                                    connection.query(query1, [username],async (error, results) => {
                                        if (error) {
                                            reject(error);
                                            console.error('Error executing query: ' + error.message);
                                            res.status(500).send('Internal Server Error');
                                            return;
                                        }else{
                                            resolve(results);
                                        }
                                    });
                                });
                                if(typeof results3[0] != "undefined"){
                                if(results3[0].blocked=="yes"){
                                    let alertMessage="User Blocked by Admin!\nContact Admin";
                                    return res.redirect(`login.html?alert=${encodeURIComponent(alertMessage)}`);
                                }
                                }
                                return res.redirect(`/camp-details?token=${token}`);
                            case 'admin':
                                return res.redirect(`/admin-home?token=${token}`);
                            default:
                                return res.status(400).send('Unknown category');
                        }
                    } else {
                        let alertMessage="Invalid username or password";
                        res.redirect(`login.html?alert=${encodeURIComponent(alertMessage)}`);
                        return;
                    }
                } else {
                    let alertMessage="Invalid username";
                    res.redirect(`login.html?alert=${encodeURIComponent(alertMessage)}`);
                    return;
                }
            } catch (err) {
                console.error('Error verifying user:', err);
                return res.status(500).send('Internal Server Error');
            } finally {
                connection.release();
            }
        }

        verifyUser(username, password);
    });
});
/////////////////////////////////////////////////////////////////////////////////////////

//handle to retireve data from database for login help//////////////////////////////
app.get('/login-help', async(req, res) => {
    pool.getConnection(async(err, connection) => {
      if (err) {
        console.error('Error connecting to database: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
      
      const Result1 = await new Promise((resolve, reject) => {
        const query1 = 'SELECT * from admininfo';
        connection.query(query1, (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        });

        connection.release();
        res.render('help', { adminInfoData:Result1[0]}); 
    });
});
////////////////////////////////////////////////////////////////////////////

//donor details form/////////////////////////////////////////////////////
app.post('/donorprof',async (req, res) => {
    //username=usernameconst1;
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
        let donorname, dob, location, pinno, latitude, longitude, contactnumber;

    if(req.body['location-method'] == 'manual') {
        ({ donorname,dob,location,pinno,contactnumber} = req.body);
        const fullAddress = `${location}, ${pinno}`;
        try {
            const coordinates = await getCoordinatesFromAddress(fullAddress);
            if (coordinates) {
                latitude = coordinates.lat;
                longitude = coordinates.lon;
            } else {
                console.log("Failed to get coordinates");
            }
        } catch (error) {
            console.error("Error getting coordinates:", error.message);
        }
    } else if(req.body['location-method'] == 'gps') {
        ({ donorname,dob,latitude,longitude,contactnumber} = req.body);
        try {
            const result = await getAddressFromCoordinates(latitude, longitude);
            if (result) {
                location = result.address;
                pinno = result.pincode;
            } else {
                console.log("Failed to get location and PIN code");
            }
        } catch (error) {
            console.error("Error getting address:", error.message);
        }
    } else {
        res.status(500).send('Please provide address.');
        return;
    }

    console.log('Received data:', {  donorname,dob,location,pinno,latitude,longitude,contactnumber});

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        try{
        const query = 'INSERT INTO donors (username,donorname,dob,location,pinno,latitude,longitude,contactnumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(query, [username,donorname,dob,location,pinno,latitude,longitude,contactnumber], (error, results) => {
            if (error) {
                console.error('Error executing query: ' + error.message);
                return;
            }
        });
        } catch (error) {
            return res.status(400).send('Contact number already taken. Please fill accurate location.');
        }
        const success=await increaseAvailableVolunteers(latitude,longitude);
        if(success!=1) {
            const query1 = 'DELETE FROM donors where username=?';
            connection.query(query1, [username], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Contact number already taken. Please fill accurate location.');
                    return;
                }
            });
            return res.status(500).send('Check Network Connectivity');
        }
        connection.release();
        res.redirect(`/donor-details?token=${token}`);
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
/////////////////////////////////////////////////////////////////////////

//handle to retireve data from database for donor home details//////////////////////////////
app.get('/donor-details', (req, res) => {
    //const username = usernameconst1;
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error connecting to database: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      const query = 'SELECT * FROM donors WHERE username = ?'; // Update table name and criteria
      connection.query(query, [username], (error, results) => {
        connection.release();
        if (error) {
          console.error('Error executing query: ' + error.message);
          res.status(500).send('Internal Server Error');
          return;
        }
  
        if (results.length === 0) {
          // Handle case where no pharmacy details found
          res.redirect(`/donorprof.html?token=${token}`);
        } else {
  
        const donorDetails = results[0]; // Assuming there's only one record per username
        res.render('donorhome', { donorDetails,token }); // Pass retrieved data to the template
        }
      });
    });
    });
    }else {
        res.redirect('/login.html');
    }
  });
////////////////////////////////////////////////////////////////////////////

//donor home update form/////////////////////////////////////////////////////
app.post('/donorhomeupdate',async(req, res) => {
    //username=usernameconst1;
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;

        let donorname, dob, location, pinno=0, latitude, longitude, contactnumber,results1;

        if(req.body['location-method'] == 'manual') {
            ({ donorname,dob,location,pinno,contactnumber} = req.body);
            const fullAddress = `${location}, ${pinno}`;
            try {
                const coordinates = await getCoordinatesFromAddress(fullAddress);
                if (coordinates) {
                    latitude = coordinates.lat;
                    longitude = coordinates.lon;
                } else {
                    console.log("Failed to get coordinates");
                }
            } catch (error) {
                console.error("Error getting coordinates:", error.message);
            }
        } else if(req.body['location-method'] == 'gps') {
            ({ donorname,dob,latitude,longitude,contactnumber} = req.body);
            try {
                const result = await getAddressFromCoordinates(latitude, longitude);
                if (result) {
                    location = result.address;
                    pinno = result.pincode;
                } else {
                    console.log("Failed to get location and PIN code");
                }
            } catch (error) {
                console.error("Error getting address:", error.message);
            }
        } else {
            ({ donorname,dob,contactnumber} = req.body);
        }
    
        console.log('Received data:', {  donorname,dob,location,pinno,latitude,longitude,contactnumber});

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        const results1 = await new Promise((resolve, reject) => {                       
        const query1 = 'select * from donors where username=?';
        connection.query(query1, [username], (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }else{
                resolve(results);
            }
        });
        });
        if(pinno!=0){
        let success=await decreaseAvailableVolunteers(results1[0].latitude,results1[0].longitude);
        if(success!=1) return res.status(500).send('Check Network Connectivity');
        success=await increaseAvailableVolunteers(latitude,longitude);
        if(success!=1) return res.status(500).send('Check Network Connectivity');
        const query = 'UPDATE donors set donorname=?,dob=?,location=?,pinno=?,latitude=?,longitude=?,contactnumber=? where username=?';
        connection.query(query, [donorname,dob,location,pinno,latitude,longitude,contactnumber,username], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Existing Contact');
                return;
            }
            else{
                res.redirect(`/donor-details?token=${token}`);
            }
        });
        } else{
            const query = 'UPDATE donors set donorname=?,dob=?,contactnumber=? where username=?';
            connection.query(query, [donorname,dob,contactnumber,username], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Existing Contact');
                return;
            }
            else{
                res.redirect(`/donor-details?token=${token}`);
            }
            });
        }
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
/////////////////////////////////////////////////////////////////////////

//volunteer details form/////////////////////////////////////////////////////
app.post('/volunteerprof',async (req, res) => {
    //username=usernameconst1;
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
        let volname, dob, address, pinno, latitude, longitude, contact;

    if(req.body['location-method'] == 'manual') {
        ({ volname,dob,address,pinno,contact} = req.body);
        const fullAddress = `${address}, ${pinno}`;
        try {
            const coordinates = await getCoordinatesFromAddress(fullAddress);
            if (coordinates) {
                latitude = coordinates.lat;
                longitude = coordinates.lon;
            } else {
                console.log("Failed to get coordinates");
            }
        } catch (error) {
            console.error("Error getting coordinates:", error.message);
        }
    } else if(req.body['location-method'] == 'gps') {
        ({ volname,dob,latitude,longitude,contact} = req.body);
        try {
            const result = await getAddressFromCoordinates(latitude, longitude);
            if (result) {
                address = result.address;
                pinno = result.pincode;
            } else {
                console.log("Failed to get location and PIN code");
            }
        } catch (error) {
            console.error("Error getting address:", error.message);
        }
    } else {
        res.status(500).send('Please provide address.');
        return;
    }
    console.log('Received data:', { volname,contact,dob,address,pinno,latitude,longitude});

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }

        const query2 = 'SELECT email FROM login WHERE username = ?'; // Update table name and criteria
        connection.query(query2, [username], (error, results) => {
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
        
        const query1 = 'SELECT level FROM admin WHERE email = ?'; // Update table name and criteria
        connection.query(query1, [results[0].email], async(error, results1) => {
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
        
        const query = 'INSERT INTO volunteers (username,volname,contact,dob,address,pinno,latitude,longitude,level) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)';
        connection.query(query, [username,volname,contact,dob,address,pinno,latitude,longitude,results1[0].level], (error, results2) => {
            connection.release();
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Please fill all details and contact shall be new(Internal Server Error).');
                return;
            }
            else{
                res.redirect(`/volunteer-details?token=${token}`);
            }
        });
        if(results1[0].level=="collector"){
            success=await availVolUpdate('none');
            if(success!=1) return res.status(500).send('Check Network Connectivity');
        }
        });
        });
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
/////////////////////////////////////////////////////////////////////////

//handle to retireve data from database for volunteer home details//////////////////////////////
app.get('/volunteer-details', (req, res) => {
    //const username = usernameconst1;
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error connecting to database: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      const query = 'SELECT * FROM volunteers WHERE username = ?'; // Update table name and criteria
      connection.query(query, [username], (error, results) => {
        connection.release();
        if (error) {
          console.error('Error executing query: ' + error.message);
          res.status(500).send('Internal Server Error');
          return;
        }
  
        if (results.length === 0) {
          // Handle case where no pharmacy details found
          res.redirect(`/volunteerprof.html?token=${token}`);
        } else {
  
        const volunteerDetails = results[0]; // Assuming there's only one record per username
        res.render('volunteerhome', { volunteerDetails,token }); 
        }
      });
    });
    });
    }else {
        res.redirect('/login.html');
    }
  });
////////////////////////////////////////////////////////////////////////////

//volunteer home update form/////////////////////////////////////////////////////
app.post('/volunteerhomeupdate',async (req, res) => {
    //username=usernameconst1;
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;

        let volname, dob, address, pinno=0, latitude, longitude, contact,active,level,success;

        if(req.body['location-method'] == 'manual') {
            ({ volname,dob,address,pinno,contact,active,level} = req.body);
            const fullAddress = `${address}, ${pinno}`;
            try {
                const coordinates = await getCoordinatesFromAddress(fullAddress);
                if (coordinates) {
                    latitude = coordinates.lat;
                    longitude = coordinates.lon;
                } else {
                    console.log("Failed to get coordinates");
                }
            } catch (error) {
                console.error("Error getting coordinates:", error.message);
            }
        } else if(req.body['location-method'] == 'gps') {
            ({ volname,dob,latitude,longitude,contact,active,level} = req.body);
            try {
                const result = await getAddressFromCoordinates(latitude, longitude);
                if (result) {
                    address = result.address;
                    pinno = result.pincode;
                } else {
                    console.log("Failed to get location and PIN code");
                }
            } catch (error) {
                console.error("Error getting address:", error.message);
            }
        } else {
            ({ volname,dob,contact,active} = req.body);
        }
        console.log('Received data:', { volname,contact,active,dob,address,pinno,latitude,longitude});

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        let results = await new Promise((resolve, reject) => {                       
        const query1 = 'SELECT * from volunteers where username=?';
        connection.query(query1, [username],async (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }else{
                resolve(results);
            }
        });
        });
        if(results[0].active=='yes' && active=='no' && level=='collector'){
            success=await availVolUpdate(username); //means avoid this username
            if(success!=1) return res.status(500).send('Check Network Connectivity');
        }
        else if(results[0].active=='no' && active=='yes' && level=='collector'){
            success=-1;
        }
        else if(results[0].active=='no' && active=='no' && level=='collector'){
            success=1;
        }else{
            success=0;
        }
        
        if(pinno!=0){
            try {
                let results1 = await new Promise((resolve, reject) => {   
                    const query = 'UPDATE volunteers set volname=?,contact=?,active=?,dob=?,address=?,pinno=?,latitude=?,longitude=? where username=?';
                    connection.query(query, [volname, contact, active, dob, address, pinno, latitude, longitude, username], (error, results) => {
                        connection.release();  // Ensure release before any return
                        
                        if (error) {
                            console.error('Error executing query:', error.message);
                            reject(error);  // Let the catch block handle it
                            return;
                        }
                        resolve(results);
                    });
                });
            } catch (error) {
                return res.status(400).send('Contact already exists');
            }
            if(level=='collector' && (success==0 || success==-1) ){
                success=await availVolUpdate('none');
                if(success!=1) return res.status(500).send('Check Network Connectivity');
            }
        } else{
            try {
            let results1 = await new Promise((resolve, reject) => {   
            const query = 'UPDATE volunteers set volname=?,contact=?,active=?,dob=? where username=?';
            connection.query(query, [volname,contact,active,dob,username], (error, results) => {
                connection.release();  // Ensure release before any return
                        
                        if (error) {
                            console.error('Error executing query:', error.message);
                            reject(error);  // Let the catch block handle it
                            return;
                        }
                        resolve(results);
                    });
                });
            } catch (error) {
                return res.status(400).send('Contact already exists');
            }
            if(level=='collector' && success==-1 ){
                success=await availVolUpdate('none');
                if(success!=1) return res.status(500).send('Check Network Connectivity');
            }
        }
        
        res.redirect(`/volunteer-details?token=${token}`);
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
/////////////////////////////////////////////////////////////////////////

//camp details form/////////////////////////////////////////////////////
app.post('/campprof',async(req, res) => {
    //username=usernameconst1;
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
        let campcoordname, location, pinno, latitude, longitude, contact;

    if(req.body['location-method'] == 'manual') {
        ({ campcoordname, location, pinno,contact} = req.body);
        const fullAddress = `${location}, ${pinno}`;
        try {
            const coordinates = await getCoordinatesFromAddress(fullAddress);
            if (coordinates) {
                latitude = coordinates.lat;
                longitude = coordinates.lon;
            } else {
                console.log("Failed to get coordinates");
            }
        } catch (error) {
            console.error("Error getting coordinates:", error.message);
        }
    } else if(req.body['location-method'] == 'gps') {
        ({ campcoordname,latitude,longitude,contact} = req.body);
        try {
            const result = await getAddressFromCoordinates(latitude, longitude);
            if (result) {
                location = result.address;
                pinno = result.pincode;
            } else {
                console.log("Failed to get location and PIN code");
            }
        } catch (error) {
            console.error("Error getting address:", error.message);
        }
    } else {
        res.status(500).send('Please provide address.');
        return;
    }

    console.log('Received data:', {  campcoordname,location,pinno,latitude,longitude,contact});

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        const query = 'INSERT INTO camps (username,campcoordname,location,pinno,latitude,longitude,contact) VALUES (?, ?, ?, ?, ?, ?, ?)';
        connection.query(query, [username,campcoordname,location,pinno,latitude,longitude,contact], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Contact already exist');
                return;
            }
            else{
                res.redirect(`/camp-details?token=${token}`);
            }
        });
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
/////////////////////////////////////////////////////////////////////////

//handle to retireve data from database for camp home details//////////////////////////////
app.get('/camp-details', (req, res) => {
    //const username = usernameconst1;
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error connecting to database: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      const query = 'SELECT * FROM camps WHERE username = ?'; // Update table name and criteria
      connection.query(query, [username], (error, results) => {
        connection.release();
        if (error) {
          console.error('Error executing query: ' + error.message);
          res.status(500).send('Internal Server Error');
          return;
        }
  
        if (results.length === 0) {
          // Handle case where no pharmacy details found
          res.redirect(`/campprof.html?token=${token}`);
        } else {
  
        const campDetails = results[0]; // Assuming there's only one record per username
        res.render('camphome', { campDetails,token }); // Pass retrieved data to the template
        }
      });
    });
    });
    }else {
        res.redirect('/login.html');
    }
  });
////////////////////////////////////////////////////////////////////////////

//camp home update form/////////////////////////////////////////////////////
app.post('/camphomeupdate', async(req, res) => {
    //username=usernameconst1;
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;

        let campcoordname, location, pinno, latitude, longitude, contact;

        if(req.body['location-method'] == 'manual') {
            ({ campcoordname, location, pinno,contact} = req.body);
            const fullAddress = `${location}, ${pinno}`;
            try {
                const coordinates = await getCoordinatesFromAddress(fullAddress);
                if (coordinates) {
                    latitude = coordinates.lat;
                    longitude = coordinates.lon;
                } else {
                    console.log("Failed to get coordinates");
                }
            } catch (error) {
                console.error("Error getting coordinates:", error.message);
            }
        } else if(req.body['location-method'] == 'gps') {
            ({ campcoordname,latitude,longitude,contact} = req.body);
            try {
                const result = await getAddressFromCoordinates(latitude, longitude);
                if (result) {
                    location = result.address;
                    pinno = result.pincode;
                } else {
                    console.log("Failed to get location and PIN code");
                }
            } catch (error) {
                console.error("Error getting address:", error.message);
            }
        } else {
            res.status(500).send('Please provide address.');
            return;
        }
    
        console.log('Received data:', {  campcoordname,location,pinno,latitude,longitude,contact});

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        const query = 'UPDATE camps set campcoordname=?,location=?,pinno=?,latitude=?,longitude=?,contact=? where username=?';
        connection.query(query, [campcoordname,location,pinno,latitude,longitude,contact,username], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Contact already exist');
                return;
            }
            else{
                res.redirect(`/camp-details?token=${token}`);
            }
        });
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
/////////////////////////////////////////////////////////////////////////

//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
//from home/history to donate
  app.get('/donordonate.html', (req, res) => {
    const token=req.query.token;
    const username=req.query.username;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/donordonate-details?token=${token}&username=${username}`);
        });
    }else {
        res.redirect('/login.html');
    }
});

//from home/donate to history
app.get('/donorhistory.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/donorhistory-details?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from donate/history to home
app.get('/donorhome.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/donor-details?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from donate/history/home to availablevol
app.get('/donoravailablevol.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/donoravailablevol-details?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from donoravailablevol to donorrequests
app.get('/donorrequests.html', (req, res) => {
    const token=req.query.token;
    const username=req.query.username;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/donor-requests?token=${token}&username=${username}`);
});
}else {
    res.redirect('/login.html');
}
});

//from camplist to campvollist
app.get('/campvollist.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/campvol-details?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from campvollist to camplist
app.get('/camplist.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/camplist-details?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from volhome to vollist
app.get('/volunteerlist.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/volunteer-list?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from vollist to volhome
app.get('/volunteerhome.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/volunteer-details?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from vollist/volhome to volstock
app.get('/volunteerstock.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/volunteer-stock?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from vollist/volhome/volstock to volhistory
app.get('/volunteerhistory.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/volunteer-history?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from vollist/volhome/volstockvolhistory to volrequest
app.get('/volunteerrequest.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/volunteer-request?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from vollist/volhome/volstockvolhistory to volseeothers
app.get('/volunteerseeothers.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/volunteer-seeothers?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from camplist/campvollist to camphome
app.get('/camphome.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/camp-details?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from camplist to campcommoditylist
app.get('/campcommoditylist.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/camp-commodity-list?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from camphome/camplist/campvollist to camphistory
app.get('/camphistory.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/camp-history?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from camphome/.... to campinfo
app.get('/campinfo.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/camp-info?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from adminpages to adminhome
app.get('/adminhome.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/admin-home?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from adminhome to adminusers
app.get('/adminusers.html', (req, res) => {
    const token=req.query.token;
    let selectedUsername=req.query.selectedUsername;
    let selectedCategory=req.query.selectedCategory;
    if(!(selectedUsername && selectedCategory)){
        selectedUsername=selectedCategory=0;
    }
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/admin-users-details?token=${token}&selectedUsername=${selectedUsername}&selectedCategory=${selectedCategory}`);
});
}else {
    res.redirect('/login.html');
}
});

//from adminpages to admininfo
app.get('/admininfo.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/admin-info?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from adminpages to admincommodity
app.get('/admincommodity.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/admin-commodity?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from adminpages to adminreport
app.get('/adminreport.html', (req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/admin-report?token=${token}`);
});
}else {
    res.redirect('/login.html');
}
});

//from login to help
app.get('/help.html', (req, res) => {
    res.redirect(`/login-help`);
});

app.get('/login.html', (req, res) => {
    res.redirect('/login');
});
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

//handle to retireve data from database for admin home//////////////////////////////
app.get('/admin-home', async(req, res) => {
    //const username = usernameconst1;
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
    pool.getConnection(async(err, connection) => {
      if (err) {
        console.error('Error connecting to database: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
      
      const [Result1, Result2,Result3,Result4,Result5] = await Promise.all([
        new Promise((resolve, reject) => {
        const query1 = 'SELECT COUNT(*) as count from camps';
        connection.query(query1, (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        }),
        new Promise((resolve, reject) => {
        const query2 = `SELECT COUNT(*) as count from volunteers where level='collector'`;
        connection.query(query2, (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        }),
        new Promise((resolve, reject) => {
        const query3 = `SELECT COUNT(*) as count from volunteers where level='collector' and active='yes'`;
        connection.query(query3, (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        }),
        new Promise((resolve, reject) => {
        const query4 = `SELECT COUNT(*) as count from volunteers where level='gatherer'`;
        connection.query(query4, (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        }),
        new Promise((resolve, reject) => {
        const query5 = `SELECT COUNT(*) as count from volunteers where level='gatherer' and active='yes'`;
        connection.query(query5, (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        })
        ]);

        connection.release();
        res.render('adminhome', { totalCamps:Result1[0].count,totalColVol:Result2[0].count,activeColVol:Result3[0].count,totalGatVol:Result4[0].count,activeGatVol:Result5[0].count,username,token }); 
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
app.get("/getDetails", (req, res) => {
    let type = req.query.type;
    let query = "";
    pool.getConnection(async(err, connection) => {
        if (err) {
          console.error('Error connecting to database: ' + err.message);
          res.status(500).send('Internal Server Error');
          return;
        }
        if (type === "camps") {
            query = "SELECT * FROM camps";
        } else if (type === "collectors") {
            query = "SELECT * FROM volunteers where level='collector' ";
        } else if (type === "gatherers") {
            query = "SELECT * FROM volunteers where level='gatherer' ";
        }

        connection.query(query, (err, results) => {
            if (err) throw err;
            else{
                if(type==="collectors" || type==="gatherers") {
                    let Results=[];
                    results.forEach(row => {
                        if(row.active=='yes'){
                            Results.push(row); // Store each row in an array
                        }
                    });
                    results.forEach(row => {
                        if(row.active=='no'){
                            Results.push(row); // Store each row in an array
                        }
                    });

                    res.json(Results);
                }else{
                    res.json(results);
                }
            }
        });
    });
});
////////////////////////////////////////////////////////////////////////////

//handle to retireve data from database for admin add users details//////////////////////////////
app.get('/admin-users-details', async(req, res) => {
    //const username = usernameconst1;
    const token=req.query.token;
    let selectedUsername=req.query.selectedUsername;
    let selectedCategory=req.query.selectedCategory;
    if(!(selectedUsername && selectedCategory)){
        selectedUsername=selectedCategory=0;
    }
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
    pool.getConnection(async(err, connection) => {
      if (err) {
        console.error('Error connecting to database: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
        let Result1 = await new Promise((resolve, reject) => {
        const query2 = `SELECT * FROM admin WHERE email NOT IN (SELECT email FROM login);`;
            connection.query(query2, (error, results) => {
                if (error) reject(error);
                else resolve(results); 
            });
        });
        let Result2 = await new Promise((resolve, reject) => {
            const query3 = `SELECT 
                    username, donorname, NULL AS volname, NULL AS campcoordname, 
                    dob, location, NULL AS address, pinno, latitude, longitude, 
                    contactnumber, NULL AS contact, NULL AS level, NULL AS active, 
                    NULL AS availabilityfactor, blocked
                FROM donors

                UNION 

                SELECT 
                    username, NULL AS donorname, volname, NULL AS campcoordname, 
                    dob, NULL AS location, address, pinno, latitude, longitude, 
                    NULL AS contactnumber, contact, level, active, availabilityfactor, blocked
                FROM volunteers

                UNION 

                SELECT 
                    username, NULL AS donorname, NULL AS volname, campcoordname, 
                    NULL AS dob, location, NULL AS address, pinno, latitude, longitude, 
                    NULL AS contactnumber, contact, NULL AS level, NULL AS active, 
                    NULL AS availabilityfactor, blocked
                FROM camps;
                `;
                connection.query(query3, (error, results) => {
                    if (error) reject(error);
                    else resolve(results); 
            });
        });
        connection.release();
        res.render('adminusers', { recentData:Result1,adminEditData:Result2,selectedUsername,selectedCategory,username,token }); 
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
////////////////////////////////////////////////////////////////////////////

//form of admin add users/////////////////////////////////////////////////////////
app.post('/adminaddusers', async (req, res) => {
    const token = req.body.token;
    if (!token) return res.redirect('/login.html');

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) return res.redirect('/login.html');

        const username = decoded.username;
        let { email, category, level } = req.body;
        console.log( email, category, level);
        let alertMessage;

        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error connecting to database: ' + err.message);
                return res.status(500).send('Internal Server Error');
            }

            const query = level
                ? 'INSERT INTO admin (email, category, level) VALUES (?, ?, ?)'
                : 'INSERT INTO admin (email, category) VALUES (?, ?)';

            const values = level ? [email, category, level] : [email, category];

            connection.query(query, values, (error, results) => {
                connection.release();  // Always release connection

                if (error) {
                    console.error('Database error:', error.message);
                    alertMessage = "Failed!\nEmail already used";
                    return res.redirect(`/admin-users-details?token=${token}&alert=${encodeURIComponent(alertMessage)}`);
                }

                alertMessage = "Success!\nCreated new user";
                return res.redirect(`/admin-users-details?token=${token}&alert=${encodeURIComponent(alertMessage)}`);
            });
        });
    });
});
app.post('/uploadcsv', (req, res) => {
    let csvData = req.body.data;

    if (!csvData || csvData.length === 0) {
        return res.json({ message: "Invalid CSV data!" });
    }
    pool.getConnection(async(err, connection) => {
        if (err) {
            return res.status(500).json({ message: "Database connection error" });
        }
        let Constemail = await new Promise((resolve, reject) => {
            const query2 = `SELECT email FROM admin`; // Select only emails
            connection.query(query2, (error, results) => {
                if (error) reject(error);
                else resolve(results.map(row => row.email)); // Extract only email values
            });
        });
        let duplicateRows = []; // Store row numbers of duplicate emails
        let invalidRows = []; // Store row numbers of duplicate emails
        // Filter out existing emails and store duplicate row numbers
        csvData = csvData.filter((row, index) => {
            if (Constemail.includes(row.email)) {
                duplicateRows.push(index + 2); // CSV row index (1-based, row 1 is heading)
                return false; // Remove from csvData
            }else if(row.email.length<11){
                return false;
            }
            if (row.category === "volunteer" && !["collector", "gatherer"].includes(row.level)) {
                invalidRows.push(index + 2);
                return false; 
            }
            if (row.category !== "volunteer" && row.category !== "campcoordinator") {
                invalidRows.push(index + 2);
                return false; 
            }
            return true; // Keep the row
        });
        // Validate category and level
        for (let row of csvData) {
            if (row.category === "campcoordinator") {
                row.level = null; // Set level as NULL
            }
        }

        let alertMessage="";
        if (duplicateRows.length > 0) {
            alertMessage+=`Existing emails found in rows: ${duplicateRows.join(", ")}\n`;
        }
        if (invalidRows.length > 0) {
            alertMessage+=`Invalid entries found in rows: ${invalidRows.join(", ")}\n`;
        }
        const query = "INSERT INTO admin (email, category, level) VALUES ?";
        const values = csvData.map(row => [row.email, row.category, row.level]);
            connection.query(query, [values], (error) => {
                connection.release();
                if (error) {
                    alertMessage+="None Uploaded.";
                    return res.json({ message: alertMessage });
                }
                if(invalidRows.length <= 0 && duplicateRows.length <= 0){
                    res.json({ message: "CSV uploaded successfully!" });
                }else{
                    alertMessage+="Other mails uploaded successfully!";
                    res.json({ message: alertMessage });
                }
            });
    });
});
/////////////////////////////////////////////////////////////////////////////////

//adminseeothers search username making easy with suggestions//////////////////////////
app.get('/adminsearch-username', (req, res) => {
    let query = req.query.term; // Get the search term
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
            const sql = `SELECT username,category FROM login WHERE username LIKE ? and category!="admin" ORDER BY username ASC`;
            connection.query(sql, [`${query}%`], (err, results) => {
                connection.release(); // Release the connection back to the pool
                if (err) {
                    console.error('Error executing query: ' + err.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.json(results); // Map to the correct column
            });
    });
});
///////////////////////////////////////////////////////////////////////

//form of admin edit users/////////////////////////////////////////////////////////
app.post('/admineditusers', async (req, res) => {
    const token = req.body.token;
    if (!token) return res.redirect('/login.html');

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) return res.redirect('/login.html');

        let { selectedUsername,selectedCategory } = req.body;
        if(selectedCategory=="volunteer"){
            let { username,level,active,blocked } = req.body;
            console.log( username,level,active,blocked);
            if(blocked=="yes"){
                active="no";
            }

            pool.getConnection(async(err, connection) => {
                if (err) {
                    console.error('Error connecting to database: ' + err.message);
                    return res.status(500).send('Internal Server Error');
                }
                let result1 = await new Promise((resolve, reject) => {
                    const query1 = `UPDATE volunteers set level=?,active=?,blocked=? where username=?`;
                    connection.query(query1,[level,active,blocked,username], (error, results) => {
                      if (error) reject(error);
                      else resolve(results);
                    });
                  });
                connection.release();  // Always release connection
            });
        } else if(selectedCategory=="campcoordinator"){
            let { username,blocked } = req.body;
            console.log( username,blocked);

            pool.getConnection(async(err, connection) => {
                if (err) {
                    console.error('Error connecting to database: ' + err.message);
                    return res.status(500).send('Internal Server Error');
                }
                let result1 = await new Promise((resolve, reject) => {
                    const query1 = `UPDATE camps set blocked=? where username=?`;
                    connection.query(query1,[blocked,username], (error, results) => {
                      if (error) reject(error);
                      else resolve(results);
                    });
                  });
                connection.release();  // Always release connection
            });
        } else if(selectedCategory=="donor"){
            let { username,blocked } = req.body;
            console.log( username,blocked);

            pool.getConnection(async(err, connection) => {
                if (err) {
                    console.error('Error connecting to database: ' + err.message);
                    return res.status(500).send('Internal Server Error');
                }
                let result1 = await new Promise((resolve, reject) => {
                    const query1 = `UPDATE donors set blocked=? where username=?`;
                    connection.query(query1,[blocked,username], (error, results) => {
                      if (error) reject(error);
                      else resolve(results);
                    });
                  });
                connection.release();  // Always release connection
            });
        }

        return res.redirect(`/admin-users-details?token=${token}&selectedUsername=${selectedUsername}&selectedCategory=${selectedCategory}`);
    });
});
///////////////////////////////////////////////////////////////////////

//handle to retireve data from database for admin info//////////////////////////////
app.get('/admin-info', async(req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
    pool.getConnection(async(err, connection) => {
      if (err) {
        console.error('Error connecting to database: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
      
      const Result1 = await new Promise((resolve, reject) => {
        const query1 = 'SELECT * from admininfo';
        connection.query(query1, (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        });

        connection.release();
        res.render('admininfo', { adminInfoData:Result1[0],username,token }); 
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
////////////////////////////////////////////////////////////////////////////

//form of admin info/////////////////////////////////////////////////////////
app.post('/admininfo', async (req, res) => {
    const token = req.body.token;
    if (!token) return res.redirect('/login.html');

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) return res.redirect('/login.html');

        let { adminname,details, contact,email, globalDurationParameter} = req.body;

            pool.getConnection(async(err, connection) => {
                if (err) {
                    console.error('Error connecting to database: ' + err.message);
                    return res.status(500).send('Internal Server Error');
                }
                let result1 = await new Promise((resolve, reject) => {
                    const query1 = `UPDATE admininfo set adminname=?,details=?, contact=?,email=?, globalDurationParameter=?`;
                    connection.query(query1,[adminname,details, contact,email, globalDurationParameter], (error, results) => {
                      if (error) reject(error);
                      else resolve(results);
                    });
                  });
                connection.release();  // Always release connection
            });
        fetchglobalDurationParameter();
        return res.redirect(`/admin-info?token=${token}`);
    });
});
///////////////////////////////////////////////////////////////////////

//handle to retireve data from database for admin commodity//////////////////////////////
app.get('/admin-commodity', async(req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
    pool.getConnection(async(err, connection) => {
      if (err) {
        console.error('Error connecting to database: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
      
      const Result1 = await new Promise((resolve, reject) => {
        const query1 = 'SELECT * from commoditytable';
        connection.query(query1, (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        });

        connection.release();
        res.render('admincommodity', { adminItemData:Result1,username,token }); 
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
////////////////////////////////////////////////////////////////////////////

//admincommodity.ejs add new item making easy with suggestions//////////////////////////
app.get('/search-unit', (req, res) => {
    const query = req.query.term; // Get the search term
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        if(query.length>0){
            const sql = `SELECT DISTINCT unit FROM commoditytable WHERE unit LIKE ? ORDER BY unit ASC`;
            connection.query(sql, [`${query}%`], (err, results) => {
                connection.release(); // Release the connection back to the pool
                if (err) {
                    console.error('Error executing query: ' + err.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.json(results.map(item => item.unit)); // Map to the correct column
            });
        } else{
            const sql = `SELECT DISTINCT unit FROM commoditytable ORDER BY unit ASC`;
            connection.query(sql, (err, results) => {
                connection.release(); // Release the connection back to the pool
                if (err) {
                    console.error('Error executing query: ' + err.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.json(results.map(item => item.unit)); // Map to the correct column
            });
        }
    });
});
app.get('/search-commodity', (req, res) => {
    const commodity = req.query.commodity;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }

        const sql = `
            SELECT commodity FROM commoditytable 
            WHERE LOWER(REPLACE(REPLACE(REPLACE(commodity, ' ', ''), '-', ''), '_', '')) LIKE ?
            OR LOWER(REPLACE(REPLACE(REPLACE(REVERSE(commodity), ' ', ''), '-', ''), '_', '')) LIKE ?
            ORDER BY commodity ASC
        `;
        const cleanedCommodity = commodity.replace(/[\s-_]/g, '').toLowerCase();
        connection.query(sql,[`%${cleanedCommodity}%`, `%${cleanedCommodity}%`], (err, results) => {
            connection.release();
            if (err) {
                console.error('Error fetching unit:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            if (results.length > 0) {
                res.json(results.map(item => item.commodity));
            } else {
                res.json({ item: 0 }); // If commodity is not found, return empty string
            }
        });
    });
});
///////////////////////////////////////////////////////////////////////

//form of add new item admin///////////////////////////////////////////////////////////////////
app.post('/admincommoditynew', (req, res) => {
    let constcommodityno;
    let already=0;
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;

    const {commodity,unit,emergency} = req.body;
    const unit1=unit;
    console.log('Received data:', {commodity,unit,emergency});

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        const query = 'SELECT * from commoditytable where commodity=?';
        connection.query(query, [commodity], async(error, results) => {
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            } else {
                const [Result] = await Promise.all([
                new Promise((resolve, reject) => {
                const query2 = `INSERT into commoditytable (commodity,unit,emergency) values (?,?,?) `;
                connection.query(query2, [commodity,unit,emergency], (error, results) => {
                    if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }else{
                        resolve(results);
                    }
                }); 
            })
        ]);
        }
        const [Result1] = await Promise.all([
            new Promise((resolve, reject) => {
                const query3 = `SELECT * from commoditytable where commodity=? `;
                connection.query(query3, [commodity], (error, results) => {
                    if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    } else {
                        resolve(results);
                    }
                }); 
                })
                ]);
                constcommodityno=Result1[0].commodityno;
                console.log(constcommodityno);
                if(already===0) {
                const query2 = `INSERT into commoditylive (commodityno,commodity,unit) values (?,?,?) `;
                connection.query(query2, [constcommodityno,commodity,unit], (error, results) => {
                    connection.release();
                    if (error) {
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                });
                }
        });
        res.redirect(`/admin-commodity?token=${token}`);       
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
//////////////////////////////////////////////////////////////////////////////////

//handle to retireve data from database for donor available vol details//////////////////////////////
app.get('/donoravailablevol-details', async(req, res) => {
    //const username = usernameconst1;
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
    pool.getConnection(async(err, connection) => {
      if (err) {
        console.error('Error connecting to database: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
      
      const [Result1, Result2] = await Promise.all([
        new Promise((resolve, reject) => {
        const query1 = 'SELECT * from donors where username=?';
        connection.query(query1, [username], (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        }),
        new Promise((resolve, reject) => {
        const query2 = `SELECT * from volunteers where level='collector' and active='yes'`;
        connection.query(query2, (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        })
        ]);
        connection.release();
        let donorCoord = { latitude: Result1[0].latitude, longitude: Result1[0].longitude };
        for(let i=0;i<Result2.length;i++) {
            const volCoord = { latitude: Result2[i].latitude, longitude: Result2[i].longitude };
            const routeDetails = await getRouteDetails(donorCoord, volCoord);
            if (!routeDetails) 
                return res.redirect(`/donordinosaur-game.html?token=${token}`); 
            Result2[i].duration=routeDetails.duration;
        }
        Result2.sort((a, b) => a.duration - b.duration);
        if(Result2.length>3) {
            // Extract the first 3 rows
            Result2 = Result2.slice(0, 3);
        }
        res.render('donoravailablevol', { donoravailablevolDetails:Result2,username,token }); 
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
////////////////////////////////////////////////////////////////////////////

//function to set availabilityfactor when donor modify/insert location//////////////////////////////
const increaseAvailableVolunteers = async (latitude, longitude) => {
    try {
      const donorCoord = { latitude, longitude };
  
      // Establish database connection
      const connection = await new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) reject(err);
          else resolve(connection);
        });
      });
  
      try {
        let volunteerDetails = await new Promise((resolve, reject) => {
            const query2 = `SELECT * FROM volunteers WHERE level = 'collector' AND active = 'yes'`;
            connection.query(query2, (error, results) => {
              if (error) reject(error);
              else resolve(results);
            });
          });
        for (let i = 0; i < volunteerDetails.length; i++) {
          const volCoord = { latitude: volunteerDetails[i].latitude, longitude: volunteerDetails[i].longitude };
          const routeDetails = await getRouteDetails(donorCoord, volCoord);
          if (!routeDetails) {
           return 0;
          }
          volunteerDetails[i].duration = routeDetails.duration;
        }
        console.log(volunteerDetails);
        if(volunteerDetails.length>1)
        volunteerDetails.sort((a, b) => a.duration - b.duration);
        if(volunteerDetails.length>3) {
            volunteerDetails = volunteerDetails.slice(0, 3);
        }
        for(let i = 0; i < volunteerDetails.length; i++){
            const query2 = `UPDATE volunteers set availabilityfactor=availabilityfactor+? WHERE username=?`;
            connection.query(query2,[3-i,volunteerDetails[i].username] ,(error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
        }
      } finally {
        // Release connection
        connection.release();
        return 1;
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
};  
const decreaseAvailableVolunteers = async (latitude, longitude) => {
    try {
      const donorCoord = { latitude, longitude };
  
      // Establish database connection
      const connection = await new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) reject(err);
          else resolve(connection);
        });
      });
  
      try {
        let volunteerDetails = await new Promise((resolve, reject) => {
            const query2 = `SELECT * FROM volunteers WHERE level = 'collector' AND active = 'yes'`;
            connection.query(query2, (error, results) => {
              if (error) reject(error);
              else resolve(results);
            });
          });
        for (let i = 0; i < volunteerDetails.length; i++) {
          const volCoord = { latitude: volunteerDetails[i].latitude, longitude: volunteerDetails[i].longitude };
          const routeDetails = await getRouteDetails(donorCoord, volCoord);
          if (!routeDetails) {
           return 0;
          }
          volunteerDetails[i].duration = routeDetails.duration;
        }
        if(volunteerDetails.length>1)
        volunteerDetails.sort((a, b) => a.duration - b.duration);
        if(volunteerDetails.length>3) {
            volunteerDetails = volunteerDetails.slice(0, 3);
        }
        for(let i = 0; i < volunteerDetails.length; i++){
            const query2 = `UPDATE volunteers set availabilityfactor=availabilityfactor-? WHERE username=?`;
            connection.query(query2,[3-i,volunteerDetails[i].username] ,(error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
        }
       
      } finally {
        // Release connection
        connection.release();
        return 1;
      }
    } catch (error) {
      console.error('Error:', error.message);
      throw new Error('Internal Server Error');
    }
};  
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//function to set availabilityfactor when volunteer modify/insert location/////////////
const availVolUpdate = async (username) => {
    try {
      const connection = await new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) reject(err);
          else resolve(connection);
        });
      });
  
      try {
        let volunteerDetails = await new Promise((resolve, reject) => {
            const query1 = `SELECT * FROM volunteers where username!=? and level='collector' and active='yes'`;
            connection.query(query1,[username], (error, results) => {
              if (error) reject(error);
              else resolve(results);
            });
        });
        for(let i=0;i<volunteerDetails.length;i++){
            const query2 = `UPDATE volunteers set availabilityfactor=0 WHERE username=?`;
            connection.query(query2,[volunteerDetails[i].username] ,(error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
        }
        let donorDetails = await new Promise((resolve, reject) => {
            const query3 = `SELECT * FROM donors`;
            connection.query(query3, (error, results) => {
              if (error) reject(error);
              else resolve(results);
            });
        });
        for (let i = 0; i < donorDetails.length; i++) 
        {
            const donorCoord = { latitude: donorDetails[i].latitude, longitude: donorDetails[i].longitude };
            for (let j = 0; j < volunteerDetails.length; j++) 
            {
                const volCoord = { latitude: volunteerDetails[j].latitude, longitude: volunteerDetails[j].longitude };
                const routeDetails = await getRouteDetails(donorCoord, volCoord);
                if (!routeDetails) {
                return 0;
                }
                volunteerDetails[j].duration = routeDetails.duration;
            }
            volunteerDetails.sort((a, b) => a.duration - b.duration);
            let slicedVolunteerDetails=volunteerDetails;
            if(slicedVolunteerDetails.length>3) {
                slicedVolunteerDetails = slicedVolunteerDetails.slice(0, 3);
            }
            for(let j = 0; j < volunteerDetails.length; j++){
                const query4 = `UPDATE volunteers set availabilityfactor=availabilityfactor+? WHERE username=?`;
                connection.query(query4,[3-j,volunteerDetails[j].username] ,(error, results) => {
                    if (error) {
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                });
            }
        }
        
      } finally {
        // Release connection
        connection.release();
        return 1;
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
};  
//////////////////////////////////////////////////////////////////////////////////////

//handle to fetch donated history details//////////////////////////////////////////////////////////////
async function getDonatedData(username) {
    try {
        const connection = await mysql2.createConnection({
            host: 'localhost', // Replace with your database server hostname/IP
            user: 'root', // Replace with your database username
            password: '', // Replace with your database password
            database: 'heisei1' // Optional - Replace with database name if needed
        });
        const [rows] = await connection.query(`SELECT * FROM donorhistory where username='${username}' `); 
        connection.end(); // Close the connection (optional - connection pool might handle it)
        if (!rows.length) { // Check for empty results
            return []; // Return empty array if no rows
          }
        return rows;
    } catch (error) {
        console.error('Error fetching history data:', error.message);
        return { error: 'Database error' };
    }
}
app.get('/donorhistory-details', async (req, res) => {
    let username;
    const token=req.query.token;
        if(token) {
            jwt.verify(token,secretKey,(err,decoded) => {
                if(err) {
                    res.redirect('/login.html');
                }
            username = decoded.username;
                });
        }else {
            res.redirect('/login.html');
        }
    const donatedData = await getDonatedData(username);
    if (donatedData.error) { 
        return res.status(500).send('Error fetching history data');
      }
    res.render('donorhistory', { donatedData,username,token });
});
////////////////////////////////////////////////////////////////////////////////////////////

//handle to fetch for donor live commodity//////////////////////////////////////////////////////////////
async function getDonateData() {
    try {
        const connection = await mysql2.createConnection({
            host: 'localhost', // Replace with your database server hostname/IP
            user: 'root', // Replace with your database username
            password: '', // Replace with your database password
            database: 'heisei1' // Optional - Replace with database name if needed
        });
        const [rows] = await connection.query(`SELECT * FROM commoditytable ORDER BY commodity ASC`); 
        connection.end(); // Close the connection (optional - connection pool might handle it)
        if (!rows.length) { // Check for empty results
            return []; // Return empty array if no rows
          }
        return rows;
    } catch (error) {
        console.error('Error fetching donate live data:', error.message);
        return { error: 'Database error' };
    }
}

app.get('/donordonate-details', async (req, res) => {
    let username;
    const token=req.query.token;
    const volusername=req.query.username;
    console.log(volusername);
        if(token) {
            jwt.verify(token,secretKey,(err,decoded) => {
                if(err) {
                    res.redirect('/login.html');
                }
            username = decoded.username;
                });
        }else {
            res.redirect('/login.html');
        }
    const donateData = await getDonateData();
    if (donateData.error) { 
        return res.status(500).send('Error fetching donate data');
      }
    res.render('donordonate', { donateData,username,token,volusername });
});
////////////////////////////////////////////////////////////////////////////////

//form of donor donate/////////////////////////////////////////////////////////
app.post('/donordonate', async (req, res) => {
    const currentDate1 = new Date();
    const hoursToAdd = 5.5; // Adjust for daylight saving time if needed  
    const indianTime = new Date(currentDate1.getTime() + (hoursToAdd * 60 * 60 * 1000));
    const currentDate=indianTime;
    const formattedDate = currentDate.toISOString().slice(0, 10);
    let username;
    const token = req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async (err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        username = decoded.username;

    let {commodity,quantity,volunteerid} = req.body;
    if (!Array.isArray(commodity)) commodity = [commodity];
    if (!Array.isArray(quantity)) quantity = [quantity];
    if (!Array.isArray(volunteerid)) volunteerid = [volunteerid];

    console.log('Received data:', {commodity,quantity,volunteerid});

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        for(let i=0; i < quantity.length; i++) {
        if (quantity[i] && parseInt(quantity[i]) > 0) {
        const [commoditynoResult, unitResult] = await Promise.all([
        new Promise((resolve, reject) => {
        const query1 = 'SELECT (commodityno) from commoditytable where commodity=?';
        connection.query(query1, [commodity[i]], (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        }),
        new Promise((resolve, reject) => {
        const query2 = 'SELECT unit from commoditytable where commodity=?';
        connection.query(query2, [commodity[i]], (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        })
        ]);
        const commodityno = commoditynoResult[0].commodityno;
        const unit = unitResult[0].unit;
        
        let result;
        try{
            result=await sendTranscBlock(username,volunteerid,'donation',commodity[i],quantity[i]);//888888888888888888888
            if(result.startsWith("Error")){
                res.render('error', { error: result });
                return;
            }
        }catch(error){
            res.render('error', { error});
            return;
        }

        const query3 = 'INSERT INTO donorhistory (username,commodityno,commodity,quantity,unit,volunteerid,date) VALUES (?, ?, ?, ?, ?, ?,?)';
        connection.query(query3, [username,commodityno,commodity[i],quantity[i],unit,volunteerid,formattedDate], (error, results) => {
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
        });
        const query4 = `INSERT INTO ${volunteerid} (commodityno,commodity,quantity,unit,receivedfrom,date	) VALUES (?, ?, ?, ?, ?, ?)`;
        connection.query(query4, [commodityno,commodity[i],quantity[i],unit,username,formattedDate	], (error, results) => {
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
        });
        const query5 = `SELECT receiveno FROM ${volunteerid} WHERE commodityno=? AND commodity=? AND quantity=? AND unit=? AND receivedfrom=? AND date=? AND status=? AND receiveno NOT IN (SELECT receiveno FROM transaction WHERE username=?)LIMIT 1`;
        connection.query(query5, [commodityno,commodity[i],quantity[i],unit,username,formattedDate,'Not_available',volunteerid], (error, results) => {
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            const query6 = `INSERT INTO transaction (username,receiveno,transactionID) VALUES (?, ?, ?)`;
            connection.query(query6, [volunteerid,results[0].receiveno,result], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
        });
        }}
        connection.release();
        res.redirect(`/donordonate-details?token=${token}&username=${volunteerid}`);
        });
    });
    }else {
        res.redirect('/login.html');
    }
});
/////////////////////////////////////////////////////////////////////////////////

//handle to retireve data from database for donor requests//////////////////////////////
app.get('/donor-requests', async(req, res) => {
    //const username = usernameconst1;
    const token=req.query.token;
    let volusername=req.query.username;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        const Result0 = await calculateVolunteerCommodityRequests(volusername);
        if(Result0.campsLists == -1) {
            return res.redirect(`/donordinosaur-game.html?token=${token}`); 
        }
        const Result00=Result0.campsLists;
        for(let i=0;i<Result00.length;i++){
            const R = await new Promise((resolve, reject) => {
            const query1 = `SELECT * from ${volusername+'stock'} where commodity=?`;
                connection.query(query1, [Result00[i].commodity], (error, results) => {
                    if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    else{
                        resolve(results);
                    }
                });
            });
            if(R.length) {
                Result00[i].remaining-=R[0].stock;
            }
        }

        connection.release();
        res.render('donorrequests', { donorReq:Result00,username,volusername,token }); 
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
////////////////////////////////////////////////////////////////////////////

//form of volunteer list receive status////////////////////////////////////////////////////////////////
app.post('/volunteercommoditystatus', async (req, res) => {
    const currentDate1 = new Date();
    const hoursToAdd = 5.5; // Adjust for daylight saving time if needed  
    const indianTime = new Date(currentDate1.getTime() + (hoursToAdd * 60 * 60 * 1000));
    const currentDate=indianTime;
    const formattedDate = currentDate.toISOString().slice(0, 10);
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;

    let {receiveno,status} = req.body;
    if (!Array.isArray(receiveno)) receiveno = [receiveno];
    if (!Array.isArray(status)) status = [status];
    console.log('Received data:', {receiveno,status});

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        for(let i=0;i<status.length;i++) {
            if(status[i]=='Received') {
            const [R] = await Promise.all([
                new Promise((resolve, reject) => {
                const query2 = `SELECT * from ${username} where receiveno=?`;
                connection.query(query2, [receiveno[i]], (error, results) => {
                    if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    else{
                        resolve(results);
                    }
                });
                })
                ]);
                console.log(R[0].receivedfrom,R[0].commodityno,R[0].quantity,username,R[0].date);

                const Result33 = await new Promise((resolve, reject) => { 
                const query = `SELECT * from transaction where username=? and receiveno=?`;
                connection.query(query, [username,receiveno[i]], (error, results) => {
                    if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }else{
                        resolve(results);
                    }
                });
                }); 

                try{
                    let result=await confirmTranscBlock( R[0].receivedfrom,Result33[0].transactionID);//888888888888888888888
                    if(result.startsWith("Error")){
                        res.render('error', { error: result });
                        return;
                    }
                }catch(error){
                    res.render('error', { error});
                    return;
                }

                const [Result1,Result11,Result111] = await Promise.all([
                    new Promise((resolve, reject) => {
                    const query1 = `UPDATE donorhistory set status='Received' where username=? and commodityno=? and quantity=? and volunteerid=? and date=? and status='Not_received' LIMIT 1`;
                    connection.query(query1, [R[0].receivedfrom,R[0].commodityno,R[0].quantity,username,R[0].date], (error, results) => {
                        if (error) {
                            reject(error);
                            console.error('Error executing query: ' + error.message);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                        else{
                            resolve(results);
                        }
                    });
                    }),
                    new Promise((resolve, reject) => {
                        const query11 = `UPDATE volcamphistory set status='Received' where username=? and commodityno=? and quantity=? and sendto=? and date=? and status='Not_received' LIMIT 1`;
                        connection.query(query11, [R[0].receivedfrom,R[0].commodityno,R[0].quantity,username,R[0].date], (error, results) => {
                            if (error) {
                                reject(error);
                                console.error('Error executing query: ' + error.message);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                            else{
                                resolve(results);
                            }
                        });
                        }),
                        new Promise((resolve, reject) => {
                            const query111 = `UPDATE commoditylive set additionrequired=additionrequired-? where commodityno=? `;
                            connection.query(query111, [R[0].quantity,R[0].commodityno], (error, results) => {
                                if (error) {
                                    reject(error);
                                    console.error('Error executing query: ' + error.message);
                                    res.status(500).send('Internal Server Error');
                                    return;
                                }
                                else{
                                    resolve(results);
                                }
                            });
                            })
                    ]);
                    const [Result2] = await Promise.all([
                        new Promise((resolve, reject) => {
                        const query3 = `SELECT stock from ${username+'stock'} where commodityno=?`;
                        connection.query(query3, [R[0].commodityno], (error, results) => {
                            if (error) {
                                reject(error);
                                console.error('Error executing query: ' + error.message);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                            else{
                                resolve(results);
                            }
                        });
                        })
                        ]);
                    if(Result2[0]){
                        const [Result3] = await Promise.all([
                            new Promise((resolve, reject) => {                       
                        const query4 = `UPDATE ${username+'stock'} set stock=stock+? where commodityno=?`;
                        connection.query(query4, [R[0].quantity,R[0].commodityno], (error, results) => {
                            if (error) {
                                reject(error);
                                console.error('Error executing query: ' + error.message);
                                res.status(500).send('Internal Server Error');
                                return;
                            }else{
                                console.log('updated');
                                resolve(results);
                            }
                        });
                        })
                        ]);
                    } else{
                        const [Result3] = await Promise.all([
                            new Promise((resolve, reject) => {                          
                        const query5 = `INSERT into ${username+'stock'} (commodityno,commodity,unit,stock) values (?,?,?,?)`;
                        connection.query(query5, [R[0].commodityno,R[0].commodity,R[0].unit,R[0].quantity], (error, results) => {
                            if (error) {
                                reject(error);
                                console.error('Error executing query: ' + error.message);
                                res.status(500).send('Internal Server Error');
                                return;
                            }else{
                                console.log('inserted');
                                resolve(results);
                            }
                        }); 
                        })
                        ]);                                              
                    }

                    const [Result3] = await Promise.all([
                        new Promise((resolve, reject) => { 
                        const query = `UPDATE ${username} set status=? where receiveno=?`;
                        connection.query(query, [status[i],receiveno[i]], (error, results) => {
                            if (error) {
                                reject(error);
                                console.error('Error executing query: ' + error.message);
                                res.status(500).send('Internal Server Error');
                                return;
                            }else{
                                resolve(results);
                            }
                        });
                        })
                    ]); 
        }
        }
        connection.release();
        res.redirect(`/volunteer-list?token=${token}`);
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
//////////////////////////////////////////////////////////////////////////////////

//form of volunteer stock send ////////////////////////////////////////////////////////////////
app.post('/volunteerstocksend', async (req, res) => {
    const currentDate1 = new Date();
    const hoursToAdd = 5.5; // Adjust for daylight saving time if needed  
    const indianTime = new Date(currentDate1.getTime() + (hoursToAdd * 60 * 60 * 1000));
    const currentDate=indianTime;
    const formattedDate = currentDate.toISOString().slice(0, 10);
    let token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;

    let {commodityno,commodity,unit,stock,sendto,quantity} = req.body;
    if (!Array.isArray(commodityno)) commodityno = [commodityno];
    if (!Array.isArray(commodity)) commodity = [commodity];
    if (!Array.isArray(unit)) unit = [unit];
    if (!Array.isArray(stock)) stock = [stock];
    if (!Array.isArray(sendto)) sendto = [sendto];
    if (!Array.isArray(quantity)) quantity = [quantity];
    console.log('Received data:', {commodityno,commodity,unit,stock,sendto,quantity});

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        const [Result0] = await Promise.all([
            new Promise((resolve, reject) => {
            const query0 = `SELECT * from volunteers where username=? `;
            connection.query(query0, [username], (error, results) => {
                if (error) {
                    reject(error);
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                } else {
                    resolve(results);
                }
            });
            })
        ]);
        let level = Result0[0].level;
        if(level == 'collector') {
            for(let i=0;i<commodityno.length;i++) {
                if(quantity[i]>0) {
                    const Result0 = await calculateVolunteerRequests(username,commodity[i]);
                    console.log(Result0);
                    if(Result0.campsLists == -1) {
                        return res.redirect(`/stockdinosaur-game.html?token=${token}`); 
                    }
                    const Result00=Result0.campsLists;
                    if(Array.isArray(Result00) && Result00.length === 0)
                    {
                        connection.release();
                        let alertMessage="None send! Send requested commodity only";
                        res.redirect(`/volunteer-stock?token=${token}&alert=${encodeURIComponent(alertMessage)}`);
                        return;
                    }
                    const filterAndFindMinimumTimestamp = (Result, send_to) => {
                        // Step 1: Filter rows where 'sendto' matches 'send_to'
                        const filteredRows = Result.filter(row => row.sendto === send_to);
                         // Step 2: If no rows are found, return 0
                        if (filteredRows.length === 0) {
                            return 0;
                        }

                        // Step 2: Find the row with the minimum timestamp
                        const rowWithMinTimestamp = filteredRows.reduce((minRow, currentRow) => {
                            return new Date(currentRow.timestamp) < new Date(minRow.timestamp) ? currentRow : minRow;
                        }, filteredRows[0]);

                        // Step 3: Format the timestamp of the result
                        const date = new Date(rowWithMinTimestamp.timestamp);
                        const formattedTimestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
                        
                        // Step 4: Return the row with formatted timestamp
                        return { ...rowWithMinTimestamp, timestamp: formattedTimestamp };
                    };
                    const Result1 = filterAndFindMinimumTimestamp(Result00, sendto[i]);
                    if(!Result1){
                        connection.release();
                        let alertMessage="None send! Send to requested address only";
                        res.redirect(`/volunteer-stock?token=${token}&alert=${encodeURIComponent(alertMessage)}`);
                        return;
                    }
                }
            }
        }
        let alertMessage="Stock successfully send are:-";
        for(let i=0;i<commodityno.length;i++) {

            const query22 = `UPDATE ${username+'stock'} set stock=? where commodityno=?`;
            connection.query(query22, [stock[i],commodityno[i]], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
        if(quantity[i]>0) {
            
            let result;
            try{
                result=await sendTranscBlock(username,sendto[i],'deliver',commodity[i],quantity[i]);//888888888888888888888
                if(result.startsWith("Error")){
                    res.render('error', { error: result });
                    return;
                }
            }catch(error){
                res.render('error', { error});
                return;
            }

            if(level == 'collector') {
            let quantitycopy = quantity[i];
            while(quantitycopy>0) {
                const Result0 = await calculateVolunteerRequests(username,commodity[i]);
                if(Result0.campsLists == -1) {
                    return res.redirect(`/stockdinosaur-game.html?token=${token}`); 
                }
                const Result00=Result0.campsLists;
                const filterAndFindMinimumTimestamp = (Result, send_to) => {
                    // Step 1: Filter rows where 'sendto' matches 'send_to'
                    const filteredRows = Result.filter(row => row.sendto === send_to);
                    if (filteredRows.length === 0) {
                        return 0;
                    }

                    // Step 2: Find the row with the minimum timestamp
                    const rowWithMinTimestamp = filteredRows.reduce((minRow, currentRow) => {
                        return new Date(currentRow.timestamp) < new Date(minRow.timestamp) ? currentRow : minRow;
                    }, filteredRows[0]);

                    // Step 3: Format the timestamp of the result
                    const date = new Date(rowWithMinTimestamp.timestamp);
                    const formattedTimestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
                    
                    // Step 4: Return the row with formatted timestamp
                    return { ...rowWithMinTimestamp, timestamp: formattedTimestamp };
                };
                const Result1 = filterAndFindMinimumTimestamp(Result00, sendto[i]);
                console.log(Result1);
                if(Result1) {
                if((Result1.additionrequired-Result1.collected)>quantitycopy) {
                    const query5 = `UPDATE campslists set collected=collected+? where username=? and commodity=? and timestamp=? LIMIT 1`;
                    connection.query(query5, [quantitycopy,Result1.username,Result1.commodity,Result1.timestamp], (error, results) => {
                        if (error) {
                            console.error('Error executing query: ' + error.message);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                    });
                    quantitycopy=0;
                } else{
                    const query6 = `UPDATE campslists set collected=additionrequired where username=? and commodity=? and timestamp=? LIMIT 1`;
                    connection.query(query6, [Result1.username,Result1.commodity,Result1.timestamp], (error, results) => {
                        if (error) {
                            console.error('Error executing query: ' + error.message);
                            res.status(500).send('Internal Server Error');
                            return;
                        }
                    });
                    quantitycopy=quantitycopy-(Result1.additionrequired-Result1.collected);
                }
                } else {
                    console.log('Remaining quantity: ',{quantitycopy});
                    quantity[i]=quantity[i]-quantitycopy;
                    quantitycopy=0;
                }
            }
            } else if(level == 'gatherer') {
                let quantitycopy = quantity[i];
                while(quantitycopy>0) {
                    const [Result0] = await new Promise((resolve, reject) => {
                        const query0 = `SELECT * from campslists where username=? and commodity=? and gathered<additionrequired ORDER BY timestamp ASC LIMIT 1`;
                        connection.query(query0, [sendto[i],commodity[i]], (error, results) => {
                            if (error) {
                                reject(error);
                                console.error('Error executing query: ' + error.message);
                                res.status(500).send('Internal Server Error');
                                return;
                            } else {
                                resolve(results);
                            }
                        });
                    });
                    if(Result0) {
                    if((Result0.additionrequired-Result0.gathered)>quantitycopy) {
                        const query00 = `UPDATE campslists set gathered=gathered+? where username=? and commodity=? and timestamp=? LIMIT 1`;
                        connection.query(query00, [quantitycopy,Result0.username,commodity[i],Result0.timestamp], (error, results) => {
                            if (error) {
                                console.error('Error executing query: ' + error.message);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                        });
                        quantitycopy=0;
                    } else {
                        const query00 = `UPDATE campslists set gathered=additionrequired where username=? and commodity=? and timestamp=? LIMIT 1`;
                        connection.query(query00, [Result0.username,commodity[i],Result0.timestamp], (error, results) => {
                            if (error) {
                                console.error('Error executing query: ' + error.message);
                                res.status(500).send('Internal Server Error');
                                return;
                            }
                        });
                        quantitycopy=quantitycopy-(Result0.additionrequired-Result0.gathered);
                    }
                    } else{
                        console.log('Remaining quantity: ',{quantitycopy});
                        quantitycopy=0;
                    }
                }
            }
            
            const query1 = `INSERT INTO ${sendto[i]} (commodityno,commodity,quantity,unit,receivedfrom,date) VALUES (?, ?, ?, ?, ?, ?)`;
            connection.query(query1, [commodityno[i],commodity[i],quantity[i],unit[i],username,formattedDate], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
            const query5 = `SELECT receiveno from ${sendto[i]} where commodityno=? and commodity=? and quantity=? and unit=? and receivedfrom=? and date=? and status=? AND receiveno NOT IN (SELECT receiveno FROM transaction WHERE username=?)LIMIT 1`;
            connection.query(query5, [commodityno[i],commodity[i],quantity[i],unit[i],username,formattedDate,'Not_available',sendto[i]], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                const query6 = `INSERT INTO transaction (username,receiveno,transactionID) VALUES (?,?, ?)`;
                connection.query(query6, [sendto[i],results[0].receiveno,result], (error, results) => {
                    if (error) {
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    console.log("Transaction Inserted");
                });
            });
            const query2 = `UPDATE ${username+'stock'} set stock=stock-? where commodityno=?`;
            connection.query(query2, [quantity[i],commodityno[i]], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
            const query3 = `INSERT INTO volcamphistory (username,commodityno,commodity,quantity,unit,sendto,date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            connection.query(query3, [username,commodityno[i],commodity[i],quantity[i],unit[i],sendto[i],formattedDate], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
        alertMessage=alertMessage+"\n"+commodity[i]+": "+quantity[i];
        }
        }
        connection.release();
        res.redirect(`/volunteer-stock?token=${token}&alert=${encodeURIComponent(alertMessage)}`);
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
//////////////////////////////////////////////////////////////////////////////////

//handle to fetch volunteer stock details////////////////////////////////////////////////////////////////
async function getVolunteerStock(username) {
    try {
        const connection = await mysql2.createConnection({
            host: 'localhost', // Replace with your database server hostname/IP
            user: 'root', // Replace with your database username
            password: '', // Replace with your database password
            database: 'heisei1' // Optional - Replace with database name if needed
        });
        const [rows] = await connection.query(`SELECT * FROM ${username+'stock'}`);
        connection.end(); // Close the connection (optional - connection pool might handle it)
        if (!rows.length) { // Check for empty results
            return []; // Return empty array if no rows
          }
        return rows;
    } catch (error) {
        console.error('Error fetching volunteer stock:', error.message);
        return { error: 'Database error' };
    }
}

app.get('/volunteer-stock', async (req, res) => {
    let username;
    const token=req.query.token;
    let alert;
    try {
        alert=req.query.alert;
    } catch {
        alert=0;
    }
        if(token) {
            jwt.verify(token,secretKey,(err,decoded) => {
                if(err) {
                    res.redirect('/login.html');
                }
            username = decoded.username;
                });
        }else {
            res.redirect('/login.html');
        }
    const volunteerStock = await getVolunteerStock(username);
    if (volunteerStock.error) { 
        return res.status(500).send('Error fetching volunteer stock');
      }
    if(alert) {
        res.render('volunteerstock', { volunteerStock,username,token,alert });
    } else {
        res.render('volunteerstock', { volunteerStock,username,token });
    }
});
//////////////////////////////////////////////////////////////////////////////////////

//handle to fetch volunteer list details////////////////////////////////////////////////////////////////
async function getVolunteerData(username) {
    try {
        const connection = await mysql2.createConnection({
            host: 'localhost', // Replace with your database server hostname/IP
            user: 'root', // Replace with your database username
            password: '', // Replace with your database password
            database: 'heisei1' // Optional - Replace with database name if needed
        });
        const [rows] = await connection.query(`SELECT * FROM ${username}`); 
        connection.end(); // Close the connection (optional - connection pool might handle it)
        if (!rows.length) { // Check for empty results
            return []; // Return empty array if no rows
          }
        return rows;
    } catch (error) {
        console.error('Error fetching volunteer data:', error.message);
        return { error: 'Database error' };
    }
}

app.get('/volunteer-list', async (req, res) => {
    let username;
    const token=req.query.token;
        if(token) {
            jwt.verify(token,secretKey,(err,decoded) => {
                if(err) {
                    res.redirect('/login.html');
                }
            username = decoded.username;
                });
        }else {
            res.redirect('/login.html');
        }
    const volunteerData = await getVolunteerData(username);
    if (volunteerData.error) { 
        return res.status(500).send('Error fetching volunteer data');
      }
    res.render('volunteerlist', { volunteerData,username,token });
});
//////////////////////////////////////////////////////////////////////////////////////

//handle to fetch volunteer send history details//////////////////////////////////////////////////////////////
async function getVolunteerSend(username) {
    try {
        const connection = await mysql2.createConnection({
            host: 'localhost', // Replace with your database server hostname/IP
            user: 'root', // Replace with your database username
            password: '', // Replace with your database password
            database: 'heisei1' // Optional - Replace with database name if needed
        });
        const [rows] = await connection.query(`SELECT * FROM volcamphistory where username='${username}' `); 
        connection.end(); // Close the connection (optional - connection pool might handle it)
        if (!rows.length) { // Check for empty results
            return []; // Return empty array if no rows
          }
        return rows;
    } catch (error) {
        console.error('Error fetching history data:', error.message);
        return { error: 'Database error' };
    }
}

app.get('/volunteer-history', async (req, res) => {
    let username;
    const token=req.query.token;
        if(token) {
            jwt.verify(token,secretKey,(err,decoded) => {
                if(err) {
                    res.redirect('/login.html');
                }
            username = decoded.username;
                });
        }else {
            res.redirect('/login.html');
        }
    const volunteerSend = await getVolunteerSend(username);
    if (volunteerSend.error) { 
        return res.status(500).send('Error fetching history data');
      }
    res.render('volunteerhistory', { volunteerSend,username,token });
});
////////////////////////////////////////////////////////////////////////////////////////////

//handle to fetch camp list details//////////////////////////////////////////////////////////////
async function getCampData(username) {
    try {
        const connection = await mysql2.createConnection({
            host: 'localhost', // Replace with your database server hostname/IP
            user: 'root', // Replace with your database username
            password: '', // Replace with your database password
            database: 'heisei1' // Optional - Replace with database name if needed
        });
        const [rows] = await connection.query(`SELECT * FROM ${username+'list'}`); 
        connection.end(); // Close the connection (optional - connection pool might handle it)
        if (!rows.length) { // Check for empty results
            return []; // Return empty array if no rows
          }
        return rows;
    } catch (error) {
        console.error('Error fetching camp data:', error.message);
        return { error: 'Database error' };
    }
}

app.get('/camplist-details', async (req, res) => {
    let username;
    const token=req.query.token;
        if(token) {
            jwt.verify(token,secretKey,(err,decoded) => {
                if(err) {
                    res.redirect('/login.html');
                }
            username = decoded.username;
                });
        }else {
            res.redirect('/login.html');
        }
    const campData = await getCampData(username);
    if (campData.error) { 
        return res.status(500).send('Error fetching camp list data');
      }
    res.render('camplist', { campData,username,token });
});
////////////////////////////////////////////////////////////////////////////////////////////////////

//handle to update camp list//////////////////////////////////////////////////////
app.post('/campcommoditystatus', async(req, res) => {
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const constusername = decoded.username;
        let additionmain;
    let {commodity,unit,stock,additionrequired,morerequired,expecton} = req.body;
    if (!Array.isArray(commodity)) commodity = [commodity];
    if (!Array.isArray(unit)) unit = [unit];
    if (!Array.isArray(stock)) stock = [stock];
    if (!Array.isArray(additionrequired)) additionrequired = [additionrequired];
    if (!Array.isArray(morerequired)) morerequired = [morerequired];
    if (!Array.isArray(expecton)) expecton = [expecton];
    //const additionrequired1 = additionrequired;
    console.log('Received data:', {commodity,stock,additionrequired,morerequired,expecton});

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        for(let i=0;i<commodity.length;i++) {
        if(stock[i]) {
        const query = `UPDATE ${constusername+'list'} set stock=? where commodity=? `;
        connection.query(query, [stock[i],commodity[i]], (error, results) => {
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
        });
        }
        if(morerequired[i]) {
                let additionrequiredold = additionrequired[i];
                let added=parseInt(additionrequired[i])+parseInt(morerequired[i]);
            const query1 = `UPDATE ${constusername+'list'} set additionrequired=? where commodity=? `;
            connection.query(query1, [added,commodity[i]], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
            const [Result,Result1] = await Promise.all([
            new Promise((resolve, reject) => {
            const query2 = `SELECT additionrequired from commoditylive where commodity=? `;
            connection.query(query2, [commodity[i]], (error, results) => {
                if (error) {
                    reject(error);
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                } else {
                    
                    resolve(results);
                }
            });
            }),
            new Promise((resolve, reject) => {
            const query3 = `SELECT * from commoditytable where commodity=? `;
            connection.query(query3, [commodity[i]], (error, results) => {
                if (error) {
                    reject(error);
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                } else {
                    
                    resolve(results);
                }
            });
            })
            ]);
            let emergencyVal=Result1[0].emergency;
            additionmain=Result[0].additionrequired;
            let additionrequiredmain = additionmain;
            console.log(additionrequired[i],additionrequiredold,additionrequiredmain);
            additionrequiredmain=additionrequiredmain+parseInt(morerequired[i]);
            const query3 = `UPDATE commoditylive set additionrequired=? where commodity=? `;
            connection.query(query3, [additionrequiredmain,commodity[i]], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
                const currentDate = new Date();
                const hoursToAdd = 5.5; // IST is UTC+5:30
                const indianTime = new Date(currentDate.getTime() + hoursToAdd * 60 * 60 * 1000);
                const formattedTimestamp = indianTime.toISOString().slice(0, 19).replace("T", " ");
                console.log("Formatted Timestamp:", formattedTimestamp);

                const query4 = `INSERT into campslists (username,commodity,unit,emergency,timestamp,additionrequired,expecton) values (?,?,?,?,?,?,?)`;
                connection.query(query4, [constusername,commodity[i],unit[i],emergencyVal,formattedTimestamp,morerequired[i],expecton[i]], (error, results) => {
                    if (error) {
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                });
            }
        }
            connection.release();
            res.redirect(`/camplist-details?token=${token}`);
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
/////////////////////////////////////////////////////////////////////////////////////

//form of add new item camp///////////////////////////////////////////////////////////////////
app.post('/campcommoditynew', (req, res) => {
    let constcommodityno;
    let already=0;
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;

    const {commodity,unit} = req.body;
    const unit1=unit;
    console.log('Received data:', {commodity,unit});

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        const [Result0] = await Promise.all([
            new Promise((resolve, reject) => {
            const query0 = `SELECT * from ${username+'list'} where commodity=?`;
            connection.query(query0, [commodity], (error, results) => {
                if (error) {
                    reject(error);
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }else{
                    resolve(results);
                }
            }); 
            })
            ]);
            if(Result0[0]){
                res.status(409).send('Commodity already exist in stock.');
                return;
            }
        const query = 'SELECT * from commoditytable where commodity=?';
        connection.query(query, [commodity], async(error, results) => {
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            } else if(results.length>0) {
                already=1;
                if((results[0].unit)!==unit1) {
                    res.status(500).send('Invalid unit');
                    return;
                }
            } else {
                const [Result] = await Promise.all([
                new Promise((resolve, reject) => {
                const query2 = `INSERT into commoditytable (commodity,unit) values (?,?) `;
                connection.query(query2, [commodity,unit], (error, results) => {
                    if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }else{
                        resolve(results);
                    }
                }); 
            })
        ]);
        }
        const [Result1] = await Promise.all([
            new Promise((resolve, reject) => {
                const query3 = `SELECT * from commoditytable where commodity=? `;
                connection.query(query3, [commodity], (error, results) => {
                    if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    } else {
                        resolve(results);
                    }
                }); 
                })
                ]);
                constcommodityno=Result1[0].commodityno;
                console.log(constcommodityno);
                const query1 = `INSERT into ${username+'list'} (commodityno,commodity,unit,stock,additionrequired) values (?,?,?,?,?) `;
                connection.query(query1, [constcommodityno,commodity,unit,0,0], (error, results) => {
                    if (error) {
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                });
                if(already===0) {
                const query2 = `INSERT into commoditylive (commodityno,commodity,unit) values (?,?,?) `;
                connection.query(query2, [constcommodityno,commodity,unit], (error, results) => {
                    connection.release();
                    if (error) {
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                });
                }
        });
        res.redirect(`/camplist-details?token=${token}`);       
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
//////////////////////////////////////////////////////////////////////////////////

//camplist.ejs add new item making easy with suggestions//////////////////////////
app.get('/search', (req, res) => {
    const query = req.query.term; // Get the search term
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        const sql = `SELECT commodity FROM commoditytable WHERE commodity LIKE ? ORDER BY commodity ASC`;
        connection.query(sql, [`${query}%`], (err, results) => {
            connection.release(); // Release the connection back to the pool
            if (err) {
                console.error('Error executing query: ' + err.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            res.json(results.map(item => item.commodity)); // Map to the correct column
        });
    });
});
app.get('/getUnit', (req, res) => {
    const commodity = req.query.commodity;
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }

        const sql = `SELECT unit FROM commoditytable WHERE commodity = ?`;
        connection.query(sql, [commodity], (err, results) => {
            connection.release();
            if (err) {
                console.error('Error fetching unit:', err);
                res.status(500).send('Internal Server Error');
                return;
            }
            if (results.length > 0) {
                res.json({ unit: results[0].unit });
            } else {
                res.json({ unit: '' }); // If commodity is not found, return empty string
            }
        });
    });
});
///////////////////////////////////////////////////////////////////////

//campcommoditylist.ejs view all commodities//////////////////////////
async function getCommodityList() {
    try {
        const connection = await mysql2.createConnection({
            host: 'localhost', // Replace with your database server hostname/IP
            user: 'root', // Replace with your database username
            password: '', // Replace with your database password
            database: 'heisei1' // Optional - Replace with database name if needed
        });
        const [rows] = await connection.query(`SELECT * FROM commoditytable`); 
        connection.end(); // Close the connection (optional - connection pool might handle it)
        if (!rows.length) { // Check for empty results
            return []; // Return empty array if no rows
          }
        return rows;
    } catch (error) {
        console.error('Error fetching camp-commodity-list data:', error.message);
        return { error: 'Database error' };
    }
}

app.get('/camp-commodity-list', async (req, res) => {
    let username;
    const token=req.query.token;
        if(token) {
            jwt.verify(token,secretKey,(err,decoded) => {
                if(err) {
                    res.redirect('/login.html');
                }
            username = decoded.username;
                });
        }else {
            res.redirect('/login.html');
        }
    const commoditylist = await getCommodityList();
    if (commoditylist.error) { 
        return res.status(500).send('Error fetching camp-commodity-list data');
      }
    res.render('campcommoditylist', { commoditylist,username,token });
});
///////////////////////////////////////////////////////////////////////

//handle to fetch camp-volunteer supply details/////////////////////////////////////////////////////////
async function getCampvolData(username) {
    try {
        const connection = await mysql2.createConnection({
            host: 'localhost', // Replace with your database server hostname/IP
            user: 'root', // Replace with your database username
            password: '', // Replace with your database password
            database: 'heisei1' // Optional - Replace with database name if needed
        });
        const [rows] = await connection.query(`SELECT * FROM ${username}`);
        connection.end(); // Close the connection (optional - connection pool might handle it)
        if (!rows.length) { // Check for empty results
            return []; // Return empty array if no rows
          }
        return rows;
    } catch (error) {
        console.error('Error fetching camp-vol supply data:', error.message);
        return { error: 'Database error' };
    }
}

app.get('/campvol-details', async (req, res) => {
    let username;
    const token=req.query.token;
        if(token) {
            jwt.verify(token,secretKey,(err,decoded) => {
                if(err) {
                    res.redirect('/login.html');
                }
            username = decoded.username;
                });
        }else {
            res.redirect('/login.html');
        }
    const campvolData = await getCampvolData(username);
    if (campvolData.error) { 
        return res.status(500).send('Error fetching camp-volunteer supply data');
      }
    res.render('campvollist', { campvolData,username,token });
});
////////////////////////////////////////////////////////////////////////////////////////////////////

//form of camp vol supply status///////////////////////////////////////////////////////////////////
app.post('/campvolcommoditystatus', async (req, res) => {
    const currentDate1 = new Date();
    const hoursToAdd = 5.5; // Adjust for daylight saving time if needed  
    const indianTime = new Date(currentDate1.getTime() + (hoursToAdd * 60 * 60 * 1000));
    const currentDate=indianTime;
    const formattedDate = currentDate.toISOString().slice(0, 10);
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
    let {receiveno,status} = req.body;
    if (!Array.isArray(receiveno)) receiveno = [receiveno];
    if (!Array.isArray(status)) status = [status];
    console.log('Received data:', {receiveno,status});
    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
       for(let i=0;i<status.length;i++) {
            if(status[i]=='Received') {

            const Result33 = await new Promise((resolve, reject) => { 
            const query = `SELECT * from transaction where username=? and receiveno=?`;
            connection.query(query, [username,receiveno[i]], (error, results) => {
                if (error) {
                    reject(error);
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }else{
                    resolve(results);
                }
            });
            }); 

            const R = await new Promise((resolve, reject) => { 
                const query = `SELECT * from ${username} where receiveno=?`;
                connection.query(query, [receiveno[i]], (error, results) => {
                    if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }else{
                        resolve(results);
                    }
                });
                }); 

            try{
                let result=await confirmTranscBlock( R[0].receivedfrom,Result33[0].transactionID);//888888888888888888888
                if(result.startsWith("Error")){
                    res.render('error', { error: result });
                    return;
                }
            }catch(error){
                res.render('error', { error});
                return;
            }

            const [Result,Result1] = await Promise.all([
            new Promise((resolve, reject) => {
            const query = `UPDATE ${username} set status=? where receiveno=?`;
            connection.query(query, [status[i],receiveno[i]], (error, results) => {
                if (error) {
                    reject(error);
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }else{
                    resolve(results);
                }
            });
        }),
            new Promise((resolve, reject) => {
            const query0 = `SELECT * from ${username} where receiveno=?`;
            connection.query(query0, [receiveno[i]], (error, results) => {
                if (error) {
                    reject(error);
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                else{
                   resolve(results);
                }
            });   
        })
        ]);
        const commodityno1=Result1[0].commodityno; 
        const commodity1=Result1[0].commodity;   
        const quantity1=Result1[0].quantity;  
        const receivedfrom1=Result1[0].receivedfrom; 
        const date1=Result1[0].date;  
        const query1 = `UPDATE ${username+'list'} set stock=stock+?,additionrequired=additionrequired-? where commodity=?`;
        connection.query(query1, [quantity1,quantity1,commodity1], (error, results) => {
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
        });  
            const query4 = `UPDATE volcamphistory set status='Received' where username=? and commodityno=? and quantity=? and sendto=? and date=? and status='Not_received' LIMIT 1`;
            connection.query(query4, [receivedfrom1,commodityno1,quantity1,username,date1], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            }); 
        }
    }
    connection.release();
    res.redirect(`/campvol-details?token=${token}`);
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
//////////////////////////////////////////////////////////////////////////////////

//form of camp send list///////////////////////////////////////////////////////////////////
app.post('/campcommoditysend', async (req, res) => {
    const currentDate1 = new Date();
    const hoursToAdd = 5.5; // Adjust for daylight saving time if needed  
    const indianTime = new Date(currentDate1.getTime() + (hoursToAdd * 60 * 60 * 1000));
    const currentDate=indianTime;
    const formattedDate = currentDate.toISOString().slice(0, 10);
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
        let {commodityno,commodity,unit,sendto,quantity} = req.body;
        if (!Array.isArray(commodityno)) commodityno = [commodityno];
        if (!Array.isArray(commodity)) commodity = [commodity];
        if (!Array.isArray(unit)) unit = [unit];
        if (!Array.isArray(sendto)) sendto = [sendto];
        if (!Array.isArray(quantity)) quantity = [quantity];
        console.log('Received data:', {commodityno,commodity,unit,sendto,quantity});
    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        for(let i=0;i<commodityno.length;i++) {
            if(quantity[i]>0) {
            
            let result;
            try{
                result=await sendTranscBlock(username,sendto[i],'leftover',commodity[i],quantity[i]);//888888888888888888888
                if(result.startsWith("Error")){
                    res.render('error', { error: result });
                    return;
                }
            }catch(error){
                res.render('error', { error});
                return;
            }

            const query1 = `INSERT INTO ${sendto[i]} (commodityno,commodity,quantity,unit,receivedfrom,date) VALUES (?, ?, ?, ?, ?, ?)`;
            connection.query(query1, [commodityno[i],commodity[i],quantity[i],unit[i],username,formattedDate], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
            const query5 = `SELECT receiveno from ${sendto[i]} where commodityno=? and commodity=? and quantity=? and unit=? and receivedfrom=? and date=? and status=? AND receiveno NOT IN (SELECT receiveno FROM transaction WHERE username=?)LIMIT 1`;
            connection.query(query5, [commodityno[i],commodity[i],quantity[i],unit[i],username,formattedDate,'Not_available',sendto[i]], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                const query6 = `INSERT INTO transaction (username,receiveno,transactionID) VALUES (?, ?, ?)`;
                connection.query(query6, [sendto[i],results[0].receiveno,result], (error, results) => {
                    if (error) {
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                });
            });
            const query2 = `UPDATE ${username+'list'} set stock=stock-? where commodityno=?`;
            connection.query(query2, [quantity[i],commodityno[i]], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
            const query3 = `INSERT INTO volcamphistory (username,commodityno,commodity,quantity,unit,sendto,date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            connection.query(query3, [username,commodityno[i],commodity[i],quantity[i],unit[i],sendto[i],formattedDate], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
        }
        }
    connection.release();
    res.redirect(`/camplist-details?token=${token}`);
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
//////////////////////////////////////////////////////////////////////////////////

//handle to fetch camp send history details//////////////////////////////////////////////////////////////
async function getCampSend(username) {
    try {
        const connection = await mysql2.createConnection({
            host: 'localhost', // Replace with your database server hostname/IP
            user: 'root', // Replace with your database username
            password: '', // Replace with your database password
            database: 'heisei1' // Optional - Replace with database name if needed
        });
        const [rows] = await connection.query(`SELECT * FROM volcamphistory where username='${username}' `); 
        connection.end(); // Close the connection (optional - connection pool might handle it)
        if (!rows.length) { // Check for empty results
            return []; // Return empty array if no rows
          }
        return rows;
    } catch (error) {
        console.error('Error fetching history data:', error.message);
        return { error: 'Database error' };
    }
}
async function getCampReq(username) {
    try {
        const connection = await mysql2.createConnection({
            host: 'localhost', // Replace with your database server hostname/IP
            user: 'root', // Replace with your database username
            password: '', // Replace with your database password
            database: 'heisei1' // Optional - Replace with database name if needed
        });
        const [rows] = await connection.query(`SELECT * FROM campslists where username='${username}' ORDER BY timestamp DESC`); 
        connection.end(); // Close the connection (optional - connection pool might handle it)
        if (!rows.length) { // Check for empty results
            return []; // Return empty array if no rows
          }
        return rows;
    } catch (error) {
        console.error('Error fetching history data:', error.message);
        return { error: 'Database error' };
    }
}
app.get('/camp-history', async (req, res) => {
    let username;
    const token=req.query.token;
        if(token) {
            jwt.verify(token,secretKey,(err,decoded) => {
                if(err) {
                    res.redirect('/login.html');
                }
            username = decoded.username;
                });
        }else {
            res.redirect('/login.html');
        }
    const campSend = await getCampSend(username);
    if (campSend.error) { 
        return res.status(500).send('Error fetching history data');
      }
      const campReq = await getCampReq(username);
    if (campReq.error) { 
        return res.status(500).send('Error fetching history data');
      }
    res.render('camphistory', { campSend,campReq,username,token });
});
////////////////////////////////////////////////////////////////////////////////////////////

//handle to retireve data from database for camp residents details//////////////////////////////
app.get('/camp-info', (req, res) => {
    //const username = usernameconst1;
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error connecting to database: ' + err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      const query = 'SELECT * FROM campresidents WHERE username = ?'; // Update table name and criteria
      connection.query(query, [username], (error, results) => {
        connection.release();
        if (error) {
          console.error('Error executing query: ' + error.message);
          res.status(500).send('Internal Server Error');
          return;
        }
        console.log(results[0]);
        const campResidentsDetails = results[0]; // Assuming there's only one record per username
        res.render('campinfo', { campResidentsDetails,username,token }); 
      });
    });
    });
    }else {
        res.redirect('/login.html');
    }
  });
////////////////////////////////////////////////////////////////////////////

//camp residents update form/////////////////////////////////////////////////////
app.post('/campresidents',async (req, res) => {
    //username=usernameconst1;
    const token=req.body.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;

        let {infants,toddlers,children,teens,young,pregnant,lactating,adults,middle_aged,seniors} = req.body;

        console.log('Received data:', {infants,toddlers,children,teens,young,pregnant,lactating,adults,middle_aged,seniors});

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        
        const query = `INSERT INTO campresidents (username,infants, toddlers, children, teens, young, pregnant, lactating, adults, middle_aged, seniors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE username = VALUES(username), infants = VALUES(infants), toddlers = VALUES(toddlers), children = VALUES(children), teens = VALUES(teens), young = VALUES(young), pregnant = VALUES(pregnant), lactating = VALUES(lactating), adults = VALUES(adults), middle_aged = VALUES(middle_aged), seniors = VALUES(seniors) `;
        connection.query(query, [username,infants, toddlers, children, teens, young, pregnant, lactating, adults, middle_aged, seniors], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                res.redirect(`/camp-info?token=${token}`);
            }
        });
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
/////////////////////////////////////////////////////////////////////////

//timestamp functions::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//timestamp return//////////////////////
function getFormattedTimestamp() {
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata', hour12: false };
    
    // Get individual date components in IST
    const year = new Intl.DateTimeFormat('en-IN', { ...options, year: 'numeric' }).format(now);
    const month = new Intl.DateTimeFormat('en-IN', { ...options, month: '2-digit' }).format(now);
    const day = new Intl.DateTimeFormat('en-IN', { ...options, day: '2-digit' }).format(now);
    const hours = new Intl.DateTimeFormat('en-IN', { ...options, hour: '2-digit' }).format(now);
    const minutes = new Intl.DateTimeFormat('en-IN', { ...options, minute: '2-digit' }).format(now);
    const seconds = new Intl.DateTimeFormat('en-IN', { ...options, second: '2-digit' }).format(now);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
////////////////////

//timestamp difference return///////////////////
function getMinutesDifference(timestamp1, timestamp2) {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    
    const diffMs = Math.abs(date2 - date1); // Difference in milliseconds
    const diffMinutes = Math.floor(diffMs / (1000 * 60)); // Convert to minutes

    return diffMinutes;
}
//////////////////////

//add days to timestamp///////////
function addDaysToTimestamp(timestamp, days) {
    // Convert MySQL TIMESTAMP to Date object (assuming it's already in IST)
    const date = new Date(timestamp); 

    if (isNaN(date.getTime())) {
        throw new Error("Invalid timestamp format");
    }

    // Add the days
    date.setDate(date.getDate() + days);

    // Format back to MySQL DATETIME format
    return date.toISOString().slice(0, 19).replace('T', ' '); 
}
/////////////////////////////
//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

//Mapping camp-volunteer requests@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//Geocoding FunctionsVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
const getCoordinatesFromAddress = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    try {
        const response = await axios.get(url);
        const data = response.data;
        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error.message);
        return null;
    }
};
const getAddressFromCoordinates = async (lat, lon) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data && data.address) {
            const houseNumber = data.address.house_number || '';
            const road = data.address.road || data.address.pedestrian || data.address.cycleway || 'Unnamed road';
            const suburb = data.address.suburb || '';
            const cityDistrict = data.address.city_district || '';
            const city = data.address.city || '';
            const town = data.address.town || '';
            const village = data.address.village || '';
            const hamlet = data.address.hamlet || '';
            const county = data.address.county || '';
            const state = data.address.state || '';
            const pincode = data.address.postcode || 'No PIN code available';

            // Construct the address, omitting empty fields
            const addressParts = [
                houseNumber,
                road,
                suburb,
                cityDistrict,
                city || town || village || hamlet, // Prefer city, then town, village, or hamlet
                county,
                state
            ].filter(part => part.trim() !== ''); // Remove empty fields

            const address = addressParts.join(', ');

            return { address, pincode };
        } else {
            throw new Error('No address details found');
        }
    } catch (error) {
        console.error('Error fetching address:', error.message);
        return null;
    }
};
let apiKeysIndex=0; //variables
const getRouteDetails = async (startCoords, endCoords) => {
    const apiKeys = [
        '5b3ce3597851110001cf6248d9b94769683f418ebda21674683da558', 
        '5b3ce3597851110001cf62488191318bc7484fe1924fe6269189f535',
        '5b3ce3597851110001cf62489e9526e65a3146b8be8db60134165db3',
        '5b3ce3597851110001cf62480c7048fe9d74451bb615e1f0dfc6ba3c',
        '5b3ce3597851110001cf62480fdb01de2fb74ac0bda27ff23510a7a6',
        '5b3ce3597851110001cf62486a94248277884033bdc9ab31bf88ab22',
        '5b3ce3597851110001cf62481b29ff6e409c4688a51a42dd409d2cfe',
        '5b3ce3597851110001cf624864592ecfd8ec4fbfa0ca7ec8e8cf9f4d',
        '5b3ce3597851110001cf6248283e26598ee14a10b3b24c3817e0ad79',
        '5b3ce3597851110001cf624892a4537039014f298a5678861b22cefc'
    ];
    //forwardformation,mad,3,4,5,6,8,9,10,11

    const url = `https://api.openrouteservice.org/v2/directions/driving-car`;

    const TIMEOUT_MS = 8000; // Timeout in milliseconds

    const timeoutPromise = () => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_MS)
    );

    for (let i = 0; i < apiKeys.length; i++) {
        try {
            const response = await Promise.race([
                axios.post(url, {
                    coordinates: [
                        [startCoords.longitude, startCoords.latitude], 
                        [endCoords.longitude, endCoords.latitude]
                    ]
                }, {
                    headers: {
                        'Authorization': apiKeys[apiKeysIndex],
                        'Content-Type': 'application/json'
                    }
                }),
                timeoutPromise()
            ]);

            const distance = response.data.routes[0].summary.distance / 1000; // km
            const duration = response.data.routes[0].summary.duration / 60; // minutes

            console.log(`API Key ${apiKeysIndex + 1} Success`);
            return { distance, duration };
        } catch (error) {
            console.error(`API Key ${apiKeysIndex + 1} Failed:`, error.message);
            ++apiKeysIndex;
            if (apiKeysIndex === apiKeys.length) {
                apiKeysIndex=0;
            }
            // If it's the last API key, return null
            if (i === apiKeys.length - 1) {
                console.error(`Tried all ${apiKeys.length} apiKeys and failed.`);
                return null;
            }
        }
    }
};
//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

//handle to fetch volunteer requests to know whom volunteer have to send//////////////////////////////
app.get('/volunteer-request', async (req, res) => {
    let token = req.query.token;
    let username;
    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) return res.redirect('/login.html');
            username = decoded.username;
        });
    } else {
        return res.redirect('/login.html');
    }

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        try{
            const [Result1,Result3] = await Promise.all([
                new Promise((resolve, reject) => {
                const query1 = `SELECT * FROM volunteers where username=?`;
                connection.query(query1, [username], (error, results) => {
                    if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }else{
                        resolve(results);
                    }
                }); 
            }),
            new Promise((resolve, reject) => {
                const query3 = `SELECT * FROM volunteers where username != ? and level='gatherer' and active='yes'`;
                connection.query(query3, [username], (error, results) => {
                    if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }else{
                        resolve(results);
                    }
                }); 
            })
            ]);
            let volCoord = { latitude: Result1[0].latitude, longitude: Result1[0].longitude };

            let Result2;
            if(Result1[0].level == 'collector') {
                Result2 = await new Promise((resolve, reject) => {
                    const query2 = `SELECT * FROM campslists where collected<additionrequired and gathered<additionrequired ORDER BY timestamp ASC`;
                    connection.query(query2, (error, results) => {
                        if (error) {
                            reject(error);
                            console.error('Error executing query: ' + error.message);
                            res.status(500).send('Internal Server Error');
                            return;
                        }else{
                            resolve(results);
                        }
                    }); 
                });
            } else if(Result1[0].level == 'gatherer') {
                let routeDetails00;
                Result2 = await new Promise((resolve, reject) => {
                const query2 = `SELECT * FROM campslists where gathered<additionrequired ORDER BY timestamp ASC`;
                connection.query(query2, (error, results) => {
                    if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }else{
                        resolve(results);
                    }
                }); 
                });
                for (let i = 0; i < Result2.length; i++) {
                    const [Result4] = await Promise.all([
                        new Promise((resolve, reject) => {
                        const query4 = `SELECT * FROM camps where username=?`;
                        connection.query(query4, [Result2[i].username], (error, results) => {
                            if (error) {
                                reject(error);
                                console.error('Error executing query: ' + error.message);
                                res.status(500).send('Internal Server Error');
                                return;
                            }else{
                                resolve(results);
                            }
                        }); 
                    })
                    ]);
                    let campCoord = { latitude: Result4[0].latitude, longitude: Result4[0].longitude };
                    routeDetails00 = await getRouteDetails(volCoord,campCoord);
                    if (!routeDetails00) {
                        return res.redirect(`/dinosaur-game.html?token=${token}`); 
                    }
                    Result2[i].duration = routeDetails00.duration;

                    let formattedTimestamp=getFormattedTimestamp();
                    console.log(formattedTimestamp);
                    let tookTimestamp=getMinutesDifference(formattedTimestamp, Result2[i].timestamp);
                    console.log(tookTimestamp);
                    if(Result2[i].duration>(Result2[i].expecton*24*60)+tookTimestamp){
                        Result2[i].username='null';
                    }

                    Result2[i].expected=addDaysToTimestamp(Result2[i].timestamp,Result2[i].expecton);
                }

                Result2 = Result2.filter(row => row.username !== 'null');

                Result2.sort((a, b) => new Date(a.expected) - new Date(b.expected));

                res.render('volunteerrequest', {
                    level:Result1[0].level,
                    campsLists:Result2,
                    username,
                    token
                });
                return;
            }
            let sendto = new Array(Result2.length);
            let minimumDuration = new Array(Result2.length);
            let routeDetails0,routeDetails1,routeDetails2;
            let totalDuration,initialDuration;
            for (let i = 0; i < Result3.length; i++) {
                routeDetails1 = await getRouteDetails(volCoord,Result3[i]);
                if (!routeDetails1) {
                    return res.redirect(`/dinosaur-game.html?token=${token}`); 
                }
                Result3[i].duration = routeDetails1.duration;
            }
            Result3.sort((a, b) => a.duration - b.duration);

            for (let i = 0; i < Result2.length; i++) {
                totalDuration = initialDuration = Infinity;
                const [Result4] = await Promise.all([
                    new Promise((resolve, reject) => {
                    const query4 = `SELECT * FROM camps where username=?`;
                    connection.query(query4, [Result2[i].username], (error, results) => {
                        if (error) {
                            reject(error);
                            console.error('Error executing query: ' + error.message);
                            res.status(500).send('Internal Server Error');
                            return;
                        }else{
                            resolve(results);
                        }
                    }); 
                })
                ]);
                let campCoord = { latitude: Result4[0].latitude, longitude: Result4[0].longitude };
                routeDetails0 = await getRouteDetails(volCoord, campCoord);
                if (!routeDetails0) {
                    return res.redirect(`/dinosaur-game.html?token=${token}`); 
                }
                for (let j = 0; j < Result3.length; j++) {
                    routeDetails2 = await getRouteDetails(Result3[j], campCoord);
                    if (!routeDetails2) {
                        return res.redirect(`/dinosaur-game.html?token=${token}`); 
                    }
                    if(routeDetails0.duration>=routeDetails2.duration) {
                        if(totalDuration>Result3[j].duration + routeDetails2.duration) {
                            if(Result3[j].duration<=globalDurationParameter*initialDuration) {
                                totalDuration = Result3[j].duration + routeDetails2.duration;
                                minimumDuration[i] = totalDuration;
                                sendto[i] = Result3[j].username;
                            }
                            break;
                        }
                    } else if(totalDuration>Result3[j].duration + routeDetails2.duration) {
                        initialDuration=Result3[j].duration;
                        totalDuration = Result3[j].duration + routeDetails2.duration;
                        minimumDuration[i] = totalDuration;
                        sendto[i] = Result3[j].username;
                    }
                }

                Result2[i].expected=addDaysToTimestamp(Result2[i].timestamp,Result2[i].expecton);
                let formattedTimestamp=getFormattedTimestamp();
                console.log(formattedTimestamp);
                let tookTimestamp=getMinutesDifference(formattedTimestamp, Result2[i].timestamp);
                if(totalDuration>(Result2[i].expecton*24*60)+tookTimestamp){
                    Result2[i].username='null';
                }

            }

            Result2.forEach((item, index) => {
                item.sendto = sendto[index];
                item.minimumDuration = minimumDuration[index];
            });

            Result2 = Result2.filter(row => row.username !== 'null');

            Result2.sort((a, b) => new Date(a.expected) - new Date(b.expected));
          
            res.render('volunteerrequest', {
                level:Result1[0].level,
                campsLists:Result2,
                username,
                token
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        } finally {
            connection.release();
        }
    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////////

//function to find whom volunteer have to send based on commodity//////////////////////////////
const calculateVolunteerRequests = async (username,commodity) => {
    return new Promise((resolve, reject) => {
            pool.getConnection(async (err, connection) => {
                if (err) return reject(new Error('Error connecting to database: ' + err.message));

                try {
                    let [Result1, Result2, Result3] = await Promise.all([
                        new Promise((resolve, reject) => {
                            const query1 = `SELECT * FROM volunteers where username=?`;
                            connection.query(query1, [username], (error, results) => {
                                if (error) return reject(new Error('Error executing query1: ' + error.message));
                                resolve(results);
                            });
                        }),
                        new Promise((resolve, reject) => {
                            const query2 = `SELECT * FROM campslists where collected<additionrequired and gathered<additionrequired and commodity=?`;
                            connection.query(query2,[commodity], (error, results) => {
                                if (error) return reject(new Error('Error executing query2: ' + error.message));
                                resolve(results);
                            });
                        }),
                        new Promise((resolve, reject) => {
                            const query3 = `SELECT * FROM volunteers where username != ? and level='gatherer' and active='yes'`;
                            connection.query(query3, [username], (error, results) => {
                                if (error) return reject(new Error('Error executing query3: ' + error.message));
                                resolve(results);
                            });
                        })
                    ]);

                    let volCoord = { latitude: Result1[0].latitude, longitude: Result1[0].longitude };
                    let sendto = new Array(Result2.length);
                    let minimumDuration = new Array(Result2.length);

                    let routeDetails0;
                    let routeDetails1;
                    let routeDetails2;
                    let totalDuration;
                    let initialDuration;
                    for (let i = 0; i < Result3.length; i++) {
                        routeDetails1 = await getRouteDetails(volCoord,Result3[i]);
                        if (!routeDetails1) {
                            resolve({
                                campsLists: -1
                            });
                        }
                        Result3[i].duration = routeDetails1.duration;
                    }
                    Result3.sort((a, b) => a.duration - b.duration);
                    for (let i = 0; i < Result2.length; i++) {
                        totalDuration = initialDuration = Infinity;
                        const [Result4] = await Promise.all([
                            new Promise((resolve, reject) => {
                            const query4 = `SELECT * FROM camps where username=?`;
                            connection.query(query4, [Result2[i].username], (error, results) => {
                                if (error) {
                                    reject(error);
                                    console.error('Error executing query: ' + error.message);
                                    res.status(500).send('Internal Server Error');
                                    return;
                                }else{
                                    resolve(results);
                                }
                            }); 
                        })
                        ]);
                        let campCoord = { latitude: Result4[0].latitude, longitude: Result4[0].longitude };
                        routeDetails0 = await getRouteDetails(volCoord, campCoord);
                        if (!routeDetails0) {
                            resolve({
                                campsLists: -1
                            });
                        }
                        for (let j = 0; j < Result3.length; j++) {
                            routeDetails2 = await getRouteDetails(Result3[j], campCoord);
                            if (!routeDetails2) {
                                resolve({
                                    campsLists: -1
                                });
                            }
                            if(routeDetails0.duration>=routeDetails2.duration) {
                                if(totalDuration>Result3[j].duration + routeDetails2.duration) {
                                    if(Result3[j].duration<=globalDurationParameter*initialDuration) {
                                        totalDuration = Result3[j].duration + routeDetails2.duration;
                                        minimumDuration[i] = totalDuration;
                                        sendto[i] = Result3[j].username;
                                    }
                                    break;
                                }
                            } else if(totalDuration>Result3[j].duration + routeDetails2.duration) {
                                initialDuration=Result3[j].duration;
                                totalDuration = Result3[j].duration + routeDetails2.duration;
                                minimumDuration[i] = totalDuration;
                                sendto[i] = Result3[j].username;
                            }
                        }
                        let formattedTimestamp=getFormattedTimestamp();
                        console.log(formattedTimestamp);
                        let tookTimestamp=getMinutesDifference(formattedTimestamp, Result2[i].timestamp);
                        console.log(tookTimestamp);
                        if(totalDuration>(Result2[i].expecton*24*60)+tookTimestamp){
                            Result2[i].username='null';
                        }

                        Result2[i].expected=addDaysToTimestamp(Result2[i].timestamp,Result2[i].expecton);
                    }
       
                    Result2.forEach((item, index) => {
                        item.sendto = sendto[index];
                        item.minimumDuration = minimumDuration[index];
                    });

                    Result2 = Result2.filter(row => row.username !== 'null');

                    Result2.sort((a, b) => new Date(a.expected) - new Date(b.expected));

                    resolve({
                        campsLists: Result2
                    });
                } catch (error) {
                    reject(error);
                } finally {
                    connection.release();
                }
            });
        });
};
//////////////////////////////////////////////////////////////////////////////////////////////

//function to find volunteer requests grouped by each commodity//////////////////////////////
const calculateVolunteerCommodityRequests = async (username) => {
    return new Promise((resolve, reject) => {
            pool.getConnection(async (err, connection) => {
                if (err) return reject(new Error('Error connecting to database: ' + err.message));

                try {
                    let [Result1, Result2, Result3] = await Promise.all([
                        new Promise((resolve, reject) => {
                            const query1 = `SELECT * FROM volunteers where username=?`;
                            connection.query(query1, [username], (error, results) => {
                                if (error) return reject(new Error('Error executing query1: ' + error.message));
                                resolve(results);
                            });
                        }),
                        new Promise((resolve, reject) => {
                            const query2 = `SELECT * FROM campslists where collected<additionrequired and gathered<additionrequired`;
                            connection.query(query2, (error, results) => {
                                if (error) return reject(new Error('Error executing query2: ' + error.message));
                                resolve(results);
                            });
                        }),
                        new Promise((resolve, reject) => {
                            const query3 = `SELECT * FROM volunteers where username != ? and level='gatherer' and active='yes'`;
                            connection.query(query3, [username], (error, results) => {
                                if (error) return reject(new Error('Error executing query3: ' + error.message));
                                resolve(results);
                            });
                        })
                    ]);

                    let volCoord = { latitude: Result1[0].latitude, longitude: Result1[0].longitude };
                    let sendto = new Array(Result2.length);
                    let minimumDuration = new Array(Result2.length);

                    let routeDetails0;
                    let routeDetails1;
                    let routeDetails2;
                    let totalDuration;
                    let initialDuration;
                    for (let i = 0; i < Result3.length; i++) {
                        routeDetails1 = await getRouteDetails(volCoord,Result3[i]);
                        if (!routeDetails1) {
                            resolve({
                                campsLists: -1
                            });
                        }
                        Result3[i].duration = routeDetails1.duration;
                    }
                    Result3.sort((a, b) => a.duration - b.duration);
                    for (let i = 0; i < Result2.length; i++) {
                        totalDuration = initialDuration = Infinity;
                        const [Result4] = await Promise.all([
                            new Promise((resolve, reject) => {
                            const query4 = `SELECT * FROM camps where username=?`;
                            connection.query(query4, [Result2[i].username], (error, results) => {
                                if (error) {
                                    reject(error);
                                    console.error('Error executing query: ' + error.message);
                                    res.status(500).send('Internal Server Error');
                                    return;
                                }else{
                                    resolve(results);
                                }
                            }); 
                        })
                        ]);
                        let campCoord = { latitude: Result4[0].latitude, longitude: Result4[0].longitude };
                        routeDetails0 = await getRouteDetails(volCoord, campCoord);
                        if (!routeDetails0) {
                            resolve({
                                campsLists: -1
                            });
                        }
                        for (let j = 0; j < Result3.length; j++) {
                            routeDetails2 = await getRouteDetails(Result3[j], campCoord);
                            if (!routeDetails2) {
                                resolve({
                                    campsLists: -1
                                });
                            }
                            if(routeDetails0.duration>=routeDetails2.duration) {
                                if(totalDuration>Result3[j].duration + routeDetails2.duration) {
                                    if(Result3[j].duration<=globalDurationParameter*initialDuration) {
                                        totalDuration = Result3[j].duration + routeDetails2.duration;
                                        minimumDuration[i] = totalDuration;
                                        sendto[i] = Result3[j].username;
                                    }
                                    break;
                                }
                            } else if(totalDuration>Result3[j].duration + routeDetails2.duration) {
                                initialDuration=Result3[j].duration;
                                totalDuration = Result3[j].duration + routeDetails2.duration;
                                minimumDuration[i] = totalDuration;
                                sendto[i] = Result3[j].username;
                            }
                        }
                        let formattedTimestamp=getFormattedTimestamp();
                        console.log(formattedTimestamp);
                        let tookTimestamp=getMinutesDifference(formattedTimestamp, Result2[i].timestamp);
                        console.log(tookTimestamp);
                        if(totalDuration>(Result2[i].expecton*24*60)+tookTimestamp){
                            Result2[i].username='null';
                        }
                        Result2[i].remaining=Result2[i].additionrequired-Result2[i].collected;
                    }

                    Result2 = Result2.filter(row => row.username !== 'null');

                    // Group by commodity and sum the remaining values
                    let groupedResult = Result2.reduce((acc, current) => {
                        // Check if the commodity already exists in the accumulator
                        let found = acc.find(item => item.commodity === current.commodity);
                        if (found) {
                        found.remaining += current.remaining; // Add remaining to existing commodity
                        } else {
                        acc.push({ commodity: current.commodity,unit: current.unit, remaining: current.remaining }); // Add new commodity
                        }
                        return acc;
                    }, []);

                    resolve({
                        campsLists: groupedResult
                    });
                } catch (error) {
                    reject(error);
                } finally {
                    connection.release();
                }
            });
        });
};
//////////////////////////////////////////////////////////////////////////////////////////////

//location map when clicked////////////////////////////////////////////////////
app.get('/get-location', async (req, res) => {
    const { username } = req.query;
    let tableName;
    let addresspinno,name,contact;
    pool.getConnection(async(err, connection) => {
        if (err) {
          console.error('Error connecting to database: ' + err.message);
          res.status(500).send('Internal Server Error');
          return;
        }
        const Result = await new Promise((resolve, reject) => {
            const query2 = `SELECT * FROM login WHERE username = ?`;
            connection.query(query2,[username], (error, results) => {
                if (error) {
                    reject(error);
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }else{
                    resolve(results);
                }
            }); 
        });
        if(Result[0].category == 'volunteer') {
            tableName="volunteers";
        } else if(Result[0].category == 'campcoordinator') {
            tableName="camps";
        } else if(Result[0].category == 'donor') {
            tableName="donors";
        }
        const query = `SELECT * FROM ${tableName} WHERE username = ?`;
        connection.query(query, [username], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        if(Result[0].category == 'volunteer') {
            addresspinno=results[0].address+", "+results[0].pinno;
            name=results[0].volname;
            contact=results[0].contact;
        } else if(Result[0].category == 'campcoordinator') {
            addresspinno=results[0].location+", "+results[0].pinno;
            name=results[0].campcoordname;
            contact=results[0].contact;
        } else if(Result[0].category == 'donor') {
            addresspinno=results[0].location+", "+results[0].pinno;
            name=results[0].donorname;
            contact=results[0].contactnumber;
        }
        if (results.length > 0) {
            res.json({
            userDetails:results[0],
            name,
            contact,
            addresspinno,
            latitude: results[0].latitude,
            longitude: results[0].longitude
            });
        } else {
            res.json({});
        }
        });
        connection.release();
    });
  });  
////////////////////////////////////////////////////////////////////////////////

//handle to retireve data from database vol see others details//////////////////////////////
app.get('/volunteer-seeothers', async(req, res) => {
    //const username = usernameconst1;
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        let username = decoded.username;
    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
      
        const Result1 = await new Promise((resolve, reject) => {
        const query1 = 'SELECT * from volunteers where username=?';
        connection.query(query1, [username], (error, results) => {
            if (error) {
                reject(error);
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Internal Server Error');
                return;
            }
            else{
                resolve(results);
            }
        });
        });
        let Result2;
        if(Result1[0].level=='collector') {
            Result2 = await new Promise((resolve, reject) => {
            const query2 = 'SELECT * from donors';
            connection.query(query2, [username], (error, results) => {
                if (error) {
                    reject(error);
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                else{
                    resolve(results);
                }
            });
            });
        }  else if(Result1[0].level=='gatherer'){
            Result2 = await new Promise((resolve, reject) => {
            const query2 = 'SELECT * from camps';
            connection.query(query2, [username], (error, results) => {
                if (error) {
                    reject(error);
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                else{
                    resolve(results);
                }
            });
            });
        }
        let volCoord = { latitude: Result1[0].latitude, longitude: Result1[0].longitude };
        for(let i=0;i<Result2.length;i++){
            const routeDetails = await getRouteDetails(volCoord,Result2[i]);
            if (!routeDetails) {
                return res.status(500).send('Check Network Connectivity.'); 
            }
            Result2[i].duration=routeDetails.duration;
        }
        Result2.sort((a, b) => a.duration - b.duration);

        if(Result1[0].level=='collector') {
        for(let i=0;i<Result2.length;i++){
            const Result3 = await new Promise((resolve, reject) => {
            const query3 = 'SELECT * from donorhistory where username=? and volunteerid=?';
            connection.query(query3, [Result2[i].username,username], (error, results) => {
                if (error) {
                    reject(error);
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                else{
                    resolve(results);
                }
            });
            });
            Result2[i].donations=Result3.length;
        }
        Result2.sort((a, b) => b.donations - a.donations); //descending
        }

        connection.release();
        res.render('volunteerseeothers', { volSearchData:Result2,username,token,level:Result1[0].level}); 
    });
    });
    }else {
        res.redirect('/login.html');
    }
});
////////////////////////////////////////////////////////////////////////////

//volunteerseeothers search name making easy with suggestions//////////////////////////
app.get('/search-name', (req, res) => {
    let query = req.query.term; // Get the search term
    let querylevel = req.query.level; // Get the search term
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        if(querylevel=='collector'){
            const sql = `SELECT username FROM donors WHERE username LIKE ? ORDER BY username ASC`;
            connection.query(sql, [`${query}%`], (err, results) => {
                connection.release(); // Release the connection back to the pool
                if (err) {
                    console.error('Error executing query: ' + err.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.json(results.map(item => item.username)); // Map to the correct column
            });
        } else if(querylevel=='gatherer'){
            const sql = `SELECT username FROM camps WHERE username LIKE ? ORDER BY username ASC`;
            connection.query(sql, [`${query}%`], (err, results) => {
                connection.release(); // Release the connection back to the pool
                if (err) {
                    console.error('Error executing query: ' + err.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.json(results.map(item => item.username)); // Map to the correct column
            });
        }
    });
});
///////////////////////////////////////////////////////////////////////
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

//BlockChain Integration88888888888888888888888888888888888888888888888888888888888888888888888888888888
//https://heiseichain-pro.onrender.com/api/blockchain/display
//https://heiseichain-pro.onrender.com/api/blockchain/displayWallet
//https://heiseichain-pro.onrender.com/api/blockchain/report
//https://heiseichain-pro.onrender.com/api/blockchain/creation
//https://heiseichain-pro.onrender.com/api/blockchain/confirm

//user registration/////////////////////////
const userRegistrationBlockchain = () => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection error:', err.message);
            return;
        }

        const query = 'SELECT username,category FROM login';
        connection.query(query, async (err, results) => { // Mark as async
            connection.release();
            if (err) {
                console.error('Query execution error:', err.message);
                return;
            }

            if (results.length > 0) {
                for (const result of results) {
                    const data = {
                        username: result.username,
                        role: result.category
                    };

                    try {
                        const response = await axios.post('https://heiseichain-pro.onrender.com/api/blockchain/register', null, { params: data });
                        console.log('Success:', response.data);
                    } catch (error) {
                        console.error('Error:', error.response?.data || error.message);
                    }

                    // Optional: Add a small delay (e.g., 1 second) between requests
                    //await new Promise(resolve => setTimeout(resolve, 1000));
                }
                console.log('initial user registration completed');
            } else {
                console.log('No data found');
            }
        });
    });
};
//////////////////////////////////

//initial transaction////////
async function sendTranscBlock( senderUsername, receiverUsername, transactionType, commodity, quantity) {
    const data = new URLSearchParams();
    data.append("senderUsername", senderUsername);
    data.append("recipientUsername", receiverUsername);
    data.append("value", quantity);
    data.append("transactionType", transactionType);
    data.append("commodity", commodity);

    return axios.post('https://heiseichain-pro.onrender.com/api/blockchain/creation', data, {
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
      .then(response => { console.log('Transaction Carried:', response.data); return response.data;})
     // .catch(error => error.response?.data || error.message);
      .catch(error => {
        // Log error to the console
        let errorMessage = error.response?.data || error.message;
        console.error('Transaction Error:', errorMessage);
        // Return the error message to the function call (ensure it's a string)
        errorMessage = `Error: ${error.response.data.error} (Status: ${error.response.status}) at ${error.response.data.path}`;
        return errorMessage ? errorMessage : 'Error occurred.';
      });
}
/////////////////////////////////

//confirm transaction////////
async function confirmTranscBlock( receivedfrom,transactionID) {
    const data = new URLSearchParams();
    data.append("senderUsername", receivedfrom);
    data.append("transactionID", transactionID);

    return axios.post('https://heiseichain-pro.onrender.com/api/blockchain/confirm', data, {
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
      .then(response => { console.log('Transaction Success:', response.data); return response.data;})
     // .catch(error => error.response?.data || error.message);
      .catch(error => {
        // Log error to the console
        let errorMessage = error.response?.data || error.message;
        console.error('Transaction Error:', errorMessage);
        // Return the error message to the function call (ensure it's a string)
        errorMessage = `Error: ${error.response.data.error} (Status: ${error.response.status}) at ${error.response.data.path}`;
        return errorMessage ? errorMessage : 'Error occurred.';
      });
}
/////////////////////////////////

//handle to retireve data from blockchain for admin report//////////////////////////////
//handle adminreport.ejs
app.get('/admin-report', async(req, res) => {
    const token=req.query.token;
    if(token) {
        jwt.verify(token,secretKey,async(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
        const username = decoded.username;

        //const browser = await puppeteer.launch({ headless: false });
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        await page.goto('https://heiseichain-pro.onrender.com/api/blockchain/displayWallet', { waitUntil: 'networkidle2' });

        // Extract text content without HTML tags
        const pageText = await page.evaluate(() => {
            return document.body.innerText; // Gets visible text only
        });                     
        
        //await browser.close();

        res.render('adminreport', { pageText,username,token }); 
    });
    }else {
        res.redirect('/login.html');
    }
});

// API to download report from blockchain
app.post('/download-report', async (req, res) => {
    let startDateTime= req.body.startDateTime;
    let endDateTime = req.body.endDateTime;
    try {
        await downloadReport(startDateTime,endDateTime);
        res.json({ success: true });
    } catch (error) {
        console.error('Failed to download report:', error);
        res.json({ success: false, message: 'Failed to download report' });
    }
});

// Function to download report from blockchain using Puppeteer
async function downloadReport(startDateTime,endDateTime) {
    let startdatePart = startDateTime.substring(0, 10);  // "08-03-2025"
    let starttimePart = startDateTime.substring(11,16); // "02:54"
    let startampmPart = startDateTime.substring(17); // "PM"

    let enddatePart = endDateTime.substring(0, 10);  // "08-03-2025"
    let endtimePart = endDateTime.substring(11,16); // "02:54"
    let endampmPart = endDateTime.substring(17); // "PM"

    //const browser = await puppeteer.launch({ headless: false });
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.goto('https://heiseichain-pro.onrender.com/api/blockchain/report', { waitUntil: 'networkidle2' });

    await page.waitForSelector('#startDateTime', { visible: true });
    await page.type('#startDateTime', startdatePart);
    await page.keyboard.press('ArrowRight');
    await page.type('#startDateTime', starttimePart);
    await page.keyboard.press('ArrowRight');
    await page.type('#startDateTime', startampmPart);

    await page.waitForSelector('#endDateTime', { visible: true });
    await page.type('#endDateTime', enddatePart);
    await page.keyboard.press('ArrowRight');
    await page.type('#endDateTime', endtimePart);
    await page.keyboard.press('ArrowRight');
    await page.type('#endDateTime', endampmPart);

    await page.waitForSelector('button[type="submit"]', { visible: true });
    await page.click('button[type="submit"]');

    console.log("Report Download Started!");

    // Wait for the file to appear in the download folder
    //await new Promise(resolve => setTimeout(resolve, 50000)); // Adjust based on actual download time

    //await browser.close();
}
////////////////////////////////////////////////////////////////////////////
//8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
