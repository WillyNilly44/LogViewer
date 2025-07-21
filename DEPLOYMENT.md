# Deployment Guide for Render

## Prerequisites

1. **AWS RDS Database**: Set up a PostgreSQL or MySQL database on AWS RDS
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **GitHub Repository**: Push your code to GitHub

## AWS RDS Setup

1. Create a new RDS instance (PostgreSQL recommended)
2. Configure security groups to allow connections
3. Note down the connection details:
   - Endpoint (DB_HOST)
   - Port (DB_PORT)
   - Database name (DB_NAME)
   - Username (DB_USER)
   - Password (DB_PASSWORD)

## Database Schema

1. Connect to your RDS instance using a SQL client
2. Execute the SQL commands in `database/schema.sql`
3. Verify the table is created and sample data is inserted

## Render Deployment

### Option 1: Using render.yaml (Recommended)

1. Push your code to GitHub
2. In Render dashboard, click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Set the required environment variables:
   - `DB_HOST`: Your RDS endpoint
   - `DB_NAME`: Your database name
   - `DB_USER`: Your database username
   - `DB_PASSWORD`: Your database password

### Option 2: Manual Setup

1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
4. Add environment variables in the Environment tab:
   ```
   NODE_ENV=production
   DB_HOST=your-rds-endpoint.amazonaws.com
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_SSL=true
   DB_TYPE=postgresql
   ```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DB_HOST` | AWS RDS endpoint | `mydb.abc123.us-east-1.rds.amazonaws.com` |
| `DB_PORT` | Database port | `5432` (PostgreSQL) or `3306` (MySQL) |
| `DB_NAME` | Database name | `logviewer` |
| `DB_USER` | Database username | `admin` |
| `DB_PASSWORD` | Database password | `your-secure-password` |
| `DB_SSL` | Enable SSL connection | `true` |
| `DB_TYPE` | Database type | `postgresql` or `mysql` |

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check security groups in AWS RDS
   - Verify credentials
   - Ensure SSL is configured correctly

2. **Build Failures**
   - Check build logs in Render dashboard
   - Verify all dependencies are listed in package.json

3. **API Errors**
   - Check if database table exists
   - Verify API endpoints are accessible
   - Check server logs for detailed errors

### Health Check

Once deployed, visit:
- `https://your-app.onrender.com/api/health` - Should return database status
- `https://your-app.onrender.com` - Main application

## Security Considerations

1. Use strong database passwords
2. Restrict database access to specific IP ranges
3. Keep dependencies updated
4. Monitor application logs regularly

## Performance Tips

1. Use connection pooling (already configured)
2. Add database indexes for frequently queried columns
3. Implement caching for static data
4. Monitor database performance with AWS CloudWatch
