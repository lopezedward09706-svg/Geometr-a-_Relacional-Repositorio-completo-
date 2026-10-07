
from rg_engine import Equation, PendingItem


def compute_E001(quantities):
    return {
        "E_vacio": 0.0,
        "|0>_definido": True,
        "ker_dim_H": 1,
        "inf_sigma_H": 0.0,
    }


E001 = Equation(
    id="E001",
    name="Silencio Armonico",
    formula="H|0> = 0",
    estado="POSTULADO",
    provides=["E_vacio", "|0>_definido", "ker_dim_H", "inf_sigma_H"],
    requires=[],
    compute=compute_E001,
    pending=[
        PendingItem("P-E001-01", "Garantiza |0> != 0?", "E002"),
        PendingItem("P-E001-02", "Unicidad dim ker(H) = 1 se refuerza?", "E002"),
        PendingItem("P-E001-03", "[H, P(0)]|0> = 0 se sigue de E1?", "E003"),
        PendingItem("P-E001-04", "|0> es fase uniforme en la red?", "E004"),
        PendingItem("P-E001-05", "Compatible con Lambda prop D != 0?", "E076"),
    ],
    capas={
        "0": {"estado": "OK", "nota": "Reformulada con 6 condiciones."},
        "1": {"estado": "OK_CON_MATIZ", "nota": "Dimensionalidad depende de ontologia."},
        "2": {"estado": "PENDIENTE", "nota": "Compatible E2. No implica E3."},
        "3": {"estado": "PARCIAL", "nota": "Limites diferidos a E4, E70."},
        "4": {"estado": "OK", "nota": "Existencia/unicidad/estabilidad postuladas."},
        "5": {"estado": "N/A", "nota": "Primer axioma."},
        "6": {"estado": "N/A_DIRECTO", "nota": "Indirecto via E76-E77."},
        "7": {"estado": "FALLA", "nota": "Conflicto con Lambda != 0 (C-004)."},
        "8": {"estado": "N/A_DIRECTO", "nota": "Condicional via E76-E77."},
        "9": {"estado": "OK_TRAS_REFORMULACION", "nota": "S1-S5 cerrados."},
    },
    contradicciones=["C-003", "C-004", "C-005"],
    notes="Postulado definicional-ontologico. Ontologia del tic."
)
