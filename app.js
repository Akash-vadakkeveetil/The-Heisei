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
const { timeStamp } = require('console');

//ejs connection
app.set('view engine', 'ejs');
app.set("views",path.resolve("./views"));
//middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Listen on environment port or 5000
app.listen(port, () => console.log(`Server listening on port ${port}`));

// MySQL
const pool = mysql.createPool({
    connectionLimit: 10000,
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: '', // Your MySQL password (leave empty if you haven't set any)
    database: 'heisei1'
});

//variables
let usernameconst1;
let globalDurationParameter=2; //increase by admin if emergency(never be equal to or less than 1)

// Handle POST request for signup//////////////////////////////////////////////////////
app.post('/signup', (req, res) => {
    let hashPassword;
    const { username, email, password, category } = req.body;
    usernameconst1=req.body.username;
    console.log('Received data:', { username, email, password, category });

    pool.getConnection(async(err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
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
        res.redirect('/login.html');
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
                                return res.redirect(`/donor-details?token=${token}`);
                            case 'volunteer':
                                return res.redirect(`/volunteer-details?token=${token}`);
                            case 'campcoordinator':
                                return res.redirect(`/camp-details?token=${token}`);
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
        const query = 'INSERT INTO donors (username,donorname,dob,location,pinno,latitude,longitude,contactnumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(query, [username,donorname,dob,location,pinno,latitude,longitude,contactnumber], (error, results) => {
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Contact number already taken. Please fill accurate location.');
                return;
            }
        });
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
                res.status(500).send('Internal Server Error');
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
                res.status(500).send('Internal Server Error');
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

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database: ' + err.message);
            res.status(500).send('Internal Server Error');
            return;
        }

        //!!!!!!!!!! we need to make availability factor when making new volunteer !!!!!!!!!!!

        const query = 'INSERT INTO volunteers (username,volname,contact,dob,address,pinno,latitude,longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(query, [username,volname,contact,dob,address,pinno,latitude,longitude], (error, results) => {
            connection.release();
            if (error) {
                console.error('Error executing query: ' + error.message);
                res.status(500).send('Please fill all details (Internal Server Error).');
                return;
            }
            else{
                res.redirect(`/volunteer-details?token=${token}`);
            }
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
            const query = 'UPDATE volunteers set volname=?,contact=?,active=?,dob=?,address=?,pinno=?,latitude=?,longitude=? where username=?';
            connection.query(query, [volname,contact,active,dob,address,pinno,latitude,longitude,username], (error, results) => {
                connection.release();
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
            if(level=='collector' && (success==0 || success==-1) ){
                success=await availVolUpdate('none');
                if(success!=1) return res.status(500).send('Check Network Connectivity');
            }
        } else{
            const query = 'UPDATE volunteers set volname=?,contact=?,active=?,dob=? where username=?';
            connection.query(query, [volname,contact,active,dob,username], (error, results) => {
                connection.release();
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
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
                res.status(500).send('Internal Server Error');
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
                res.status(500).send('Internal Server Error');
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
    if(token) {
        jwt.verify(token,secretKey,(err,decoded) => {
            if(err) {
                res.redirect('/login.html');
            }
    res.redirect(`/donordonate-details?token=${token}`);
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

app.get('/login.html', (req, res) => {
    res.redirect('/login');
});
//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

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
        let donorpinno;
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
                return res.status(500).send('Check Network Connectivity');
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

//function to set availabilityfactor when volunteer modify/insert location/////////////
const averageAvailabilityfactor = async () => {
    try {
      const connection = await new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) reject(err);
          else resolve(connection);
        });
      });
      let averageAvailabilityfactor=0;
      try {
        let volunteerDetails = await new Promise((resolve, reject) => {
            const query1 = `SELECT * FROM volunteers where level='collector' and active='yes'`;
            connection.query(query1, (error, results) => {
              if (error) reject(error);
              else resolve(results);
            });
        });
        for(let i=0;i<volunteerDetails.length;i++){
            averageAvailabilityfactor+=volunteerDetails[i].availabilityfactor;
        }
        averageAvailabilityfactor/=volunteerDetails.length;
      } finally {
        // Release connection
        connection.release();
        return averageAvailabilityfactor;
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
        const [rows] = await connection.query(`SELECT * FROM commoditylive where additionrequired>0`); 
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
    res.render('donordonate', { donateData,username,token });
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
            // else{
            //     res.redirect('/donordonate-details');
            // }
        });
        }}
        connection.release();
        res.redirect(`/donordonate-details?token=${token}`);
        });
    });
    }else {
        res.redirect('/login.html');
    }
});
/////////////////////////////////////////////////////////////////////////////////

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
    let {commodity,stock,additionrequired} = req.body;
    if (!Array.isArray(commodity)) commodity = [commodity];
    if (!Array.isArray(stock)) stock = [stock];
    if (!Array.isArray(additionrequired)) additionrequired = [additionrequired];
    //const additionrequired1 = additionrequired;
    console.log('Received data:', {commodity,stock,additionrequired});

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
        if(additionrequired[i]) {
            const [Resultold] = await Promise.all([
                new Promise((resolve, reject) => {
                const query0 = `SELECT additionrequired from ${constusername+'list'} where commodity=? `;
                connection.query(query0, [commodity[i]], (error, results) => {
                    if (error) {
                        reject(error);
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    } else {
                        //const additionrequiredold = parseInt(Resultold[0].additionrequired);
                        resolve(results);
                    }
                });
                })
                ]);
                let additionrequiredold = parseInt(Resultold[0].additionrequired);
                if(additionrequired[i]<additionrequiredold) {
                    res.status(500).send('Cannot lower placed requirement!');
                    return;
                }
            const query1 = `UPDATE ${constusername+'list'} set additionrequired=? where commodity=? `;
            connection.query(query1, [additionrequired[i],commodity[i]], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
            const [Result] = await Promise.all([
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
            })
            ]);
            additionmain=Result[0].additionrequired;
            let additionrequiredmain = additionmain;
            console.log(additionrequired[i],additionrequiredold,additionrequiredmain);
            additionrequiredmain=additionrequiredmain-additionrequiredold;
            additionrequiredmain=additionrequiredmain+parseInt(additionrequired[i]);
            const query3 = `UPDATE commoditylive set additionrequired=? where commodity=? `;
            connection.query(query3, [additionrequiredmain,commodity[i]], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
            if(additionrequired[i]>additionrequiredold) {
                const currentDate = new Date();
                const hoursToAdd = 5.5; // IST is UTC+5:30
                const indianTime = new Date(currentDate.getTime() + hoursToAdd * 60 * 60 * 1000);
                const formattedTimestamp = indianTime.toISOString().slice(0, 19).replace("T", " ");
                console.log("Formatted Timestamp:", formattedTimestamp);

                const query4 = `INSERT into campslists (username,commodity,timestamp,additionrequired) values (?,?,?,?)`;
                connection.query(query4, [constusername,commodity[i],formattedTimestamp,additionrequired[i]-additionrequiredold], (error, results) => {
                    if (error) {
                        console.error('Error executing query: ' + error.message);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                });
            }
           // getCampMapInfo(constusername,commodity[i]); //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ m a p
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
            // const query3 = `UPDATE commoditylive set additionrequired=additionrequired-? where commodity=? `;
            // connection.query(query3, [quantity1,commodity1], (error, results) => {
            //     if (error) {
            //         console.error('Error executing query: ' + error.message);
            //         res.status(500).send('Internal Server Error');
            //         return;
            //     }
            // }); 
            const query4 = `UPDATE volcamphistory set status='Received' where username=? and commodityno=? and quantity=? and sendto=? and date=? and status='Not_received' LIMIT 1`;
            connection.query(query4, [receivedfrom1,commodityno1,quantity1,username,date1], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            }); 

           // getCampMapInfo(username,commodity1); //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ m a p
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
            const query1 = `INSERT INTO ${sendto[i]} (commodityno,commodity,quantity,unit,receivedfrom,date) VALUES (?, ?, ?, ?, ?, ?)`;
            connection.query(query1, [commodityno[i],commodity[i],quantity[i],unit[i],username,formattedDate], (error, results) => {
                if (error) {
                    console.error('Error executing query: ' + error.message);
                    res.status(500).send('Internal Server Error');
                    return;
                }
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
    res.render('camphistory', { campSend,username,token });
});
////////////////////////////////////////////////////////////////////////////////////////////

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
const getRouteDetails = async (startCoords, endCoords) => {
    const apiKey = '5b3ce3597851110001cf6248d9b94769683f418ebda21674683da558'; // Replace with your OpenRouteService API key
    const url = `https://api.openrouteservice.org/v2/directions/driving-car`;

    try {
        const response = await axios.post(url, {
            coordinates: [
                [startCoords.longitude, startCoords.latitude], // Start coordinates (longitude, latitude)
                [endCoords.longitude, endCoords.latitude]     // End coordinates (longitude, latitude)
            ]
        }, {
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });

        // Extract duration from the response
        const distance = response.data.routes[0].summary.distance / 1000; // Duration in kilometers
        const duration = response.data.routes[0].summary.duration / 60; // Duration in minutes

        console.log('Roadway Duration (km):', distance);
        console.log('Travel Time (mins):', duration);

        return { distance, duration };
    } catch (error) {
        console.error("Error fetching route details from OpenRouteService:", error.message);
        return null;
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
            let availabilityfactor=0;
            if(Result1[0].availabilityfactor>=averageAvailabilityfactor()){
                availabilityfactor=1;
            }
            let Result2=[];
            if(Result1[0].level == 'collector') {
                timeStamp
                const Result22 = await new Promise((resolve, reject) => {
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
                for(let i=0;i<Result22.length;i++){

                }
            } else if(Result1[0].level == 'gatherer') {
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
                    res.render('volunteerrequest', {
                        level:Result1[0].level,
                        campsLists:Result2,
                        username,
                        token
                    });
                    return;
            }
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
            }

            Result2.forEach((item, index) => {
                item.sendto = sendto[index];
                item.minimumDuration = minimumDuration[index];
            });
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
                    const [Result1, Result2, Result3] = await Promise.all([
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
                    }
                           
                    Result2.forEach((item, index) => {
                        item.sendto = sendto[index];
                        item.minimumDuration = minimumDuration[index];
                    });

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
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

//Camp AI++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
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
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
