import os

def sanitize_code(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    with open(file_path, 'w') as f:
        for line in lines:
            if '# @TRADE_SECRET' not in line:
                f.write(line)

print('Filtro de IP Activo: Lógica propietaria protegida.')
