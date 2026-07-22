# AWS Free Tier deployment

This deployment runs the Node.js scraper and PostgreSQL on one Ubuntu EC2
instance. PostgreSQL is bound to `127.0.0.1`, so port 5432 is not exposed to
the internet. The database is stored in a named Docker volume.

## 1. Create a cost guardrail

In AWS Billing, create a monthly AWS Budget before launching resources. Add
email alerts at low thresholds such as 50%, 80%, and 100% of the chosen budget.
Also check the Free Tier credit-expiry date in Billing.

## 2. Launch EC2 in Mumbai

Open EC2 in `ap-south-1` and launch an instance with:

- Name: `psx-scraper`
- AMI: Ubuntu Server 24.04 LTS (Free Tier eligible)
- Instance type: `t3.micro` (Free Tier eligible)
- Key pair: create/download a `.pem` key
- Auto-assign public IP: enabled
- Security group inbound: SSH TCP 22 from **My IP** only
- Storage: Free Tier eligible `gp3`; 10 GiB is sufficient for this project

Do not add inbound rules for PostgreSQL port 5432.

## 3. Upload and install

Deployment is currently paused. When it resumes, create the deployment archive
from the monorepo root so that the root workspace files and `apps/` structure
are preserved. Then replace the key path and EC2 IP below:

```powershell
scp -i "C:\path\psx-key.pem" .\psx-scraper-deploy.zip ubuntu@EC2_PUBLIC_IP:/home/ubuntu/
ssh -i "C:\path\psx-key.pem" ubuntu@EC2_PUBLIC_IP
```

On EC2, run:

```bash
sudo apt-get update
sudo apt-get install -y unzip
unzip psx-scraper-deploy.zip -d psx-portfolio
cd psx-portfolio
sudo bash apps/scraper/deploy/install.sh
```

The installer performs an immediate test scrape and enables the schedule.

## 4. Verify

```bash
systemctl list-timers psx-scraper.timer
sudo systemctl status psx-scraper.timer
sudo journalctl -u psx-scraper.service -n 100 --no-pager
sudo docker compose --env-file /etc/psx-scraper.env -f /opt/psx-scraper/compose.yaml exec db \
  psql -U psx_scraper -d psx -c "SELECT COUNT(*) FROM stocks;"
```

The timer runs Monday through Friday at 18:00 in the `Asia/Karachi` timezone.
Because `Persistent=true`, a missed run starts after the instance comes back.

## Useful operations

Run the scraper manually:

```bash
sudo systemctl start psx-scraper.service
```

Follow logs:

```bash
sudo journalctl -u psx-scraper.service -f
```

Stop the schedule and database:

```bash
sudo systemctl disable --now psx-scraper.timer
sudo docker compose --env-file /etc/psx-scraper.env -f /opt/psx-scraper/compose.yaml down
```

Do not add `-v` to the final command unless the PostgreSQL data is intentionally
being deleted.
