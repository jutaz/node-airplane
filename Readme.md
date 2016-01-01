## Airplane

This is a node module to discover and connect to Apple Airport base stations.
Currently there are no other tools to modify airport settings, and this is about to change that by providing OSS alternative, written in pure JS.

This is loosely based on [airport-utils](https://launchpad.net/ubuntu/+source/airport-utils), but since that tool is a bit out of date and does not work correctly anymore (besides, it requires `JVM 1.5` to run), however it was a great place to start digging into protocol and understand how it works.

## Installation

```
npm install --save node-airplane
```

## Usage

General Disclaimer - the API is not even 50% complete, and the code may not work as intended and might break your airport configuration (Mine is still fine, but who knows what can happen). It\`s best that this software is used on non critical hardware.

This is still TBD, but see `examples` section to get the idea of how this works.

### Known setting reference:

- `syPR`: Read community
- `syPW`: Read/write community
- `waCV`: Configuration mode
- `waIn`: Ethernet/Modem switch 1
- `raRo`: Microwave robustness flag
- `raCl`: Closed network flag
- `raDe`: Access point density
- `raMu`: Multicast rate
- `raCh`: Wireless channel
- `moID`: Modem timeout
- `moPD`: Dialing type (tone or pulse)
- `moAD`: Automatic dial
- `moCC`: Phone country code
- `moCI`: Modem country code combo box index
- `raNm`: Network name
- `moPN`: Primary phone number
- `moAP`: Secondary phone number
- `peID`: PPPoE idle timeout
- `peAC`: PPPoE auto connect
- `peSC`: PPPoE stay connected
- `raWM`: Encryption switch
- `raWE`: Encryption key
- `laIP`: Private LAN base station address
- `laSM`: Private LAN subnet mask
- `raWB`: Wireless to Ethernet bridging switch
- `acEn`: Access control switch
- `acTa`: Access control info
- `raDS`: Wireless DHCP switch
- `laDS`: LAN Ethernet DHCP switch
- `waDS`: WAN Ethernet DHCP switch
- `raNA`: NAT switch
- `waIP`: Base station IP address
- `waRA`: Router IP address
- `waSM`: Subnet mask
- `syCt`: Contact person name
- `syNm`: Base station name
- `syLo`: Base station location
- `waDC`: DHCP client ID
- `dhBg`: DHCP address range start
- `dhEn`: DHCP address range end
- `waD1`: Primary DNS server
- `waD2`: Secondary DNS server
- `dhLe`: DHCP lease time
- `waDN`: Domain name
- `pmTa`: Port mapping
- `moUN`: Dial-up username
- `moPW`: Dial-up password
- `peUN`: PPPoE username
- `pePW`: PPPoE password
- `peSN`: PPPoE service name
- `acRB`: Reboot flag

## License

See `LICENSE`.
