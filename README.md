# MKStack

Template for building Nostr client application with React 18.x, TailwindCSS 3.x, Vite, shadcn/ui, and Nostrify.

## Development Server

This project is also running on a remote Ubuntu server at `192.168.0.243` for development purposes.

### Server Setup

To run the development server on the remote machine:

1. SSH into the server: `ssh server@192.168.0.243`
2. Navigate to project: `cd /home/server/podtardstr`
3. Start development server: `npm run dev -- --host 0.0.0.0 --port 8082`
4. Access from local machine: `http://192.168.0.243:8082/`

**Note**: Port 8082 has been configured in the server's UFW firewall to allow external connections.