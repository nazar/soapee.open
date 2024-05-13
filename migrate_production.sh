ssh -i deploy/keys/production -Cfo ExitOnForwardFailure=yes -N -L 5432:localhost:5432 soapee@soapee.com
NODE_ENV=production yarn workspace database run migrate:latest
PID=$(pgrep -f 'N -L 5432:')
kill ${PID}
[ "$PID" ] || exit 1
