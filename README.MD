# node-auto-dump

- A tiny NodeJS app that dumps MySQL with cron.
- Run in docker is advised.

## Configuration

```text
{
  "cronTime": "0 0 * * *", // how often do you wish to dump
  "timezone": "Asia/Shanghai",
  "defaultKeep": 7,
  "instances": [ // dump from multiple server
    {
      "host": "127.0.0.1",
      "port": "3306",
      "user": "root",
      "password": "your_password",
      "databases": { // dump multiple schemas
        "database_1": {
          "keep": 10 // if you want to keep more dumps
        },
        "database_2": {}
      }
    }
  ]
}
```

## Dump path

```bash
approot:/dumps
```

## Run

```bash
npm start
```
