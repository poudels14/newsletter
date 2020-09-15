Setting up MySQL Server:

Wiki Links:

- Setting up Debian Server:
  - https://www.digitalocean.com/community/tutorials/initial-server-setup-with-debian-10
- Installing MySQL:
  - https://www.digitalocean.com/community/tutorials/how-to-install-the-latest-mysql-on-debian-10
  - Followed by: https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-18-04
- Securing MySQL:
  - https://www.digitalocean.com/community/tutorials/how-to-secure-mysql-and-mariadb-databases-in-a-linux-vps
  - https://severalnines.com/database-blog/ten-tips-how-achieve-mysql-and-mariadb-security
-

Update OS:

- apt update

Create a new user with home directory:

- adduser -m testUser

Add the user to sudo group

- usermod -aG sudo testUser

Install firewall:

- apt install ufw

Allow OpenSSH through firewall and enable firewall:

- ufw allow OpenSSH
- ufw enable

Follow Installing MySQL tutorial:

Grant Limited access to the new user:

- CREATE USER 'all'@'%' INDENTIFIED BY 'users password';
- GRANT SELECT, INSERT, UPDATE, DELETE ON databsename.\* TO 'username'@'localhost';

Disable ability to load local files:

- In file /etc/mysql/my.cnf, add the following lines:

[mysqld]
local-infile=0

Use block storage instead of default disk:

- https://www.digitalocean.com/community/tutorials/how-to-move-a-mysql-data-directory-to-a-new-location-on-ubuntu-18-04
