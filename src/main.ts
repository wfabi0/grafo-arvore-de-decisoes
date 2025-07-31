import "./style.css";
import { Network, DataSet } from "vis-network/standalone/esm/vis-network.js";
import type {
  Node,
  Edge,
  Options,
  IdType,
} from "vis-network/standalone/esm/vis-network.js";

interface TreeNode extends Node {
  category?: string;
  name?: string;
  level?: number;
  parentId?: IdType;
}

const nodes = new DataSet<TreeNode, "id">([]);
const edges = new DataSet<Edge>([]);

let nodeIdCounter: number = 1;
let maxLevel: number = 0;
let selectedNodeId: IdType | null = null;

const container = document.getElementById("graph-container") as HTMLDivElement;

const data = {
  nodes: nodes,
  edges: edges,
};

const options: Options = {
  nodes: {
    shape: "box",
    size: 30,
    font: {
      size: 16,
      color: "#ffffff",
      face: "Segoe UI, Arial, sans-serif",
      strokeWidth: 1,
      strokeColor: "#000000",
    },
    borderWidth: 3,
    shadow: {
      enabled: true,
      color: "rgba(0,0,0,0.3)",
      size: 5,
      x: 2,
      y: 2,
    },
  },
  edges: {
    width: 2,
    color: {
      color: "#848484",
      highlight: "#646cff",
    },
    arrows: {
      to: {
        enabled: true,
        scaleFactor: 1,
      },
    },
    smooth: {
      enabled: true,
      type: "continuous",
      roundness: 0.5,
    },
  },
  layout: {
    hierarchical: {
      enabled: true,
      direction: "UD",
      sortMethod: "directed",
      levelSeparation: 150,
      nodeSpacing: 100,
    },
  },
  physics: {
    enabled: false,
  },
  interaction: {
    tooltipDelay: 200,
    hideEdgesOnDrag: true,
    selectConnectedEdges: true,
  },
};

const network = new Network(container, data, options);

function showModal(title: string, message: string): void {
  const modal = document.getElementById("custom-modal") as HTMLDivElement;
  const modalTitle = document.getElementById(
    "modal-title"
  ) as HTMLHeadingElement;
  const modalText = document.getElementById(
    "modal-text"
  ) as HTMLParagraphElement;

  modalTitle.textContent = title;
  modalText.textContent = message;
  modal.style.display = "block";

  modal.focus();
}

function hideModal(): void {
  const modal = document.getElementById("custom-modal") as HTMLDivElement;
  modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("custom-modal") as HTMLDivElement;
  const closeBtn = document.querySelector(".modal-close") as HTMLSpanElement;
  const okBtn = document.getElementById("modal-ok-btn") as HTMLButtonElement;

  closeBtn.addEventListener("click", hideModal);

  okBtn.addEventListener("click", hideModal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      hideModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.style.display === "block") {
      hideModal();
    }
  });
});

network.on("click", function (params) {
  if (params.nodes.length > 0) {
    const nodeId = params.nodes[0];
    const node = nodes.get(nodeId) as TreeNode;
    if (node) {
      const parentInput = document.getElementById(
        "parent-input"
      ) as HTMLInputElement;
      parentInput.value = node.id?.toString() || "";

      selectNodeForDeletion(nodeId);

      console.log(`Nó selecionado: ${node.name} (ID: ${node.id})`);
    }
  } else {
    deselectNode();
  }
});

function createRootNode(): void {
  if (nodes.length === 0) {
    const rootNode: TreeNode = {
      id: nodeIdCounter++,
      label: "Início",
      category: "root",
      name: "Início",
      level: 0,
      color: {
        background: "#7c3aed",
        border: "#5b21b6",
      },
    };
    nodes.add(rootNode);
    maxLevel = 0;
    console.log("Nó raiz criado!");
  }
}

function addItem(): void {
  const parentInput = document.getElementById(
    "parent-input"
  ) as HTMLInputElement;
  const categoryInput = document.getElementById(
    "category-input"
  ) as HTMLInputElement;
  const nameInput = document.getElementById("name-input") as HTMLInputElement;

  const parentIdentifier = parentInput.value.trim();
  const category = categoryInput.value.trim();
  const name = nameInput.value.trim();

  if (!category || !name) {
    showModal("Erro", "Por favor, preencha a categoria e o nome!");
    return;
  }

  let parentNode: TreeNode | null = null;

  if (parentIdentifier) {
    const allNodes = nodes.get() as TreeNode[];
    parentNode =
      allNodes.find(
        (node) =>
          node.id?.toString() === parentIdentifier ||
          node.name?.toLowerCase() === parentIdentifier.toLowerCase()
      ) || null;

    if (!parentNode) {
      showModal("Erro", "Nó pai não encontrado! Use o ID ou nome exato.");
      return;
    }
  } else {
    const allNodes = nodes.get() as TreeNode[];
    parentNode = allNodes.find((node) => node.category === "root") || null;

    if (!parentNode) {
      createRootNode();
      const allNodesUpdated = nodes.get() as TreeNode[];
      parentNode =
        allNodesUpdated.find((node) => node.category === "root") || null;
    }
  }

  if (!parentNode) {
    showModal("Erro", "Erro ao encontrar nó pai!");
    return;
  }

  const newLevel = (parentNode.level || 0) + 1;
  maxLevel = Math.max(maxLevel, newLevel);

  const newNode: TreeNode = {
    id: nodeIdCounter++,
    label: `${category}\n${name}`,
    category: category,
    name: name,
    level: newLevel,
    parentId: parentNode.id,
    color: {
      background: getColorByLevel(newLevel),
      border: "#1f2937",
    },
  };

  nodes.add(newNode);

  const newEdge: Edge = {
    from: parentNode.id,
    to: newNode.id,
  };
  edges.add(newEdge);

  console.log(
    `Item "${name}" (${category}) adicionado como filho de "${parentNode.name}"`
  );

  parentInput.value = "";
  categoryInput.value = "";
  nameInput.value = "";
}

function getColorByLevel(level: number): string {
  const colors = [
    "#7c3aed", // Nível 0 - Roxo vibrante
    "#059669", // Nível 1 - Verde esmeralda
    "#dc2626", // Nível 2 - Vermelho vibrante
    "#2563eb", // Nível 3 - Azul vibrante
    "#ea580c", // Nível 4 - Laranja vibrante
    "#0891b2", // Nível 5 - Ciano vibrante
  ];
  return colors[level % colors.length];
}

function countAndListCombinations(): void {
  const allNodes = nodes.get() as TreeNode[];
  const leafNodes = allNodes.filter((node) => {
    const hasChildren = edges.get().some((edge) => edge.from === node.id);
    return !hasChildren && node.category !== "root";
  });

  if (leafNodes.length === 0) {
    showModal("Aviso", "Não há caminhos completos na árvore!");
    return;
  }

  const allPaths: TreeNode[][] = [];

  leafNodes.forEach((leaf) => {
    const path = getPathToRoot(leaf, allNodes);
    allPaths.push(path);
  });

  const combinationsText = allPaths
    .map((path, index) => {
      const pathDescription = path
        .reverse()
        .slice(1)
        .map((node) => `${node.category}: ${node.name}`)
        .join(" + ");
      return `${index + 1}. ${pathDescription}`;
    })
    .join("\n");

  highlightAllPaths(allPaths);

  showModal(
    "Todas as Combinações",
    `Total de combinações possíveis: ${allPaths.length}\n\nTodas as combinações:\n${combinationsText}`
  );
}

function analyzeComplexity(): void {
  const allNodes = nodes.get() as TreeNode[];
  const leafNodes = allNodes.filter((node) => {
    const hasChildren = edges.get().some((edge) => edge.from === node.id);
    return !hasChildren && node.category !== "root";
  });

  if (leafNodes.length === 0) {
    showModal("Aviso", "Não há caminhos completos na árvore!");
    return;
  }

  let simplestPath: TreeNode[] = [];
  let complexPath: TreeNode[] = [];
  let shortestLength = Infinity;
  let longestLength = 0;

  leafNodes.forEach((leaf) => {
    const path = getPathToRoot(leaf, allNodes);
    if (path.length < shortestLength) {
      shortestLength = path.length;
      simplestPath = path;
    }
    if (path.length > longestLength) {
      longestLength = path.length;
      complexPath = path;
    }
  });

  highlightComplexityPaths(simplestPath, complexPath);

  const simplestDescription = simplestPath
    .reverse()
    .slice(1)
    .map((node) => `${node.category}: ${node.name}`)
    .join(" + ");

  const complexDescription = complexPath
    .reverse()
    .slice(1)
    .map((node) => `${node.category}: ${node.name}`)
    .join(" + ");

  showModal(
    "Análise de Complexidade",
    `🟢 LOOK MAIS SIMPLES (${
      shortestLength - 1
    } escolhas):\n${simplestDescription}\n\n` +
      `🔴 LOOK MAIS COMPLEXO (${
        longestLength - 1
      } escolhas):\n${complexDescription}\n\n` +
      `Diferença: ${longestLength - shortestLength} escolhas adicionais`
  );
}

function getPathToRoot(node: TreeNode, allNodes: TreeNode[]): TreeNode[] {
  const path: TreeNode[] = [node];
  let currentNode = node;

  while (currentNode.parentId) {
    const parent = allNodes.find((n) => n.id === currentNode.parentId);
    if (parent) {
      path.push(parent);
      currentNode = parent;
    } else {
      break;
    }
  }

  return path;
}

function highlightAllPaths(paths: TreeNode[][]): void {
  resetHighlight();

  const colors = ["#ff6b6b", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];

  paths.forEach((path, index) => {
    const color = colors[index % colors.length];

    path.forEach((node) => {
      nodes.update({
        id: node.id,
        color: {
          background: color,
          border: "#1f2937",
        },
      });
    });

    highlightEdgesForPath(path, color);
  });
}

function highlightComplexityPaths(
  simplestPath: TreeNode[],
  complexPath: TreeNode[]
): void {
  resetHighlight();

  simplestPath.forEach((node) => {
    nodes.update({
      id: node.id,
      color: {
        background: "#10b981",
        border: "#065f46",
      },
    });
  });

  complexPath.forEach((node) => {
    nodes.update({
      id: node.id,
      color: {
        background: "#ef4444",
        border: "#991b1b",
      },
    });
  });

  highlightEdgesForPath(simplestPath, "#10b981");
  highlightEdgesForPath(complexPath, "#ef4444");
}

function resetHighlight(): void {
  const allNodes = nodes.get() as TreeNode[];
  allNodes.forEach((node) => {
    nodes.update({
      id: node.id,
      color: {
        background: getColorByLevel(node.level || 0),
        border: "#1f2937",
      },
    });
  });

  const allEdges = edges.get();
  allEdges.forEach((edge) => {
    edges.update({
      id: edge.id,
      color: {
        color: "#848484",
        highlight: "#646cff",
      },
    });
  });
}

function highlightEdgesForPath(
  path: TreeNode[],
  color: string = "#ff6b6b"
): void {
  const allEdges = edges.get();

  for (let i = 0; i < path.length - 1; i++) {
    const fromNode = path[i + 1]; // Pai
    const toNode = path[i]; // Filho

    const edge = allEdges.find(
      (e) => e.from === fromNode.id && e.to === toNode.id
    );
    if (edge) {
      edges.update({
        id: edge.id,
        color: {
          color: color,
          highlight: color,
        },
      });
    }
  }
}

function resetGraph(): void {
  nodes.clear();
  edges.clear();
  nodeIdCounter = 1;
  maxLevel = 0;
  console.log("Grafo resetado!");
}

function centerGraph(): void {
  network.fit({
    animation: {
      duration: 800,
      easingFunction: "easeInOutQuad",
    },
  });
  console.log("Gráfico centralizado!");
}

function selectNodeForDeletion(nodeId: IdType): void {
  if (selectedNodeId) {
    const prevNode = nodes.get(selectedNodeId) as TreeNode;
    if (prevNode) {
      nodes.update({
        id: selectedNodeId,
        borderWidth: 3,
        color: {
          background: getColorByLevel(prevNode.level || 0),
          border: "#1f2937",
        },
      });
    }
  }

  selectedNodeId = nodeId;
  const node = nodes.get(nodeId) as TreeNode;

  if (node) {
    nodes.update({
      id: nodeId,
      borderWidth: 6,
      color: {
        background: getColorByLevel(node.level || 0),
        border: "#ff6b6b",
      },
    });

    const deleteBtn = document.getElementById(
      "delete-item-btn"
    ) as HTMLButtonElement;
    deleteBtn.disabled = false;
    deleteBtn.textContent = `Excluir: ${node.name}`;
  }
}

function deselectNode(): void {
  if (selectedNodeId) {
    const node = nodes.get(selectedNodeId) as TreeNode;
    if (node) {
      nodes.update({
        id: selectedNodeId,
        borderWidth: 3,
        color: {
          background: getColorByLevel(node.level || 0),
          border: "#1f2937",
        },
      });
    }
  }

  selectedNodeId = null;

  const deleteBtn = document.getElementById(
    "delete-item-btn"
  ) as HTMLButtonElement;
  deleteBtn.disabled = true;
  deleteBtn.textContent = "Excluir Item Selecionado";
}

function deleteSelectedItem(): void {
  if (!selectedNodeId) {
    showModal(
      "Aviso",
      "Nenhum item selecionado! Clique em um nó da árvore primeiro."
    );
    return;
  }

  const nodeToDelete = nodes.get(selectedNodeId) as TreeNode;

  if (!nodeToDelete) {
    showModal("Erro", "Nó não encontrado!");
    return;
  }

  if (nodeToDelete.category === "root") {
    showModal("Erro", "Não é possível excluir o nó raiz!");
    return;
  }

  const hasChildren = edges.get().some((edge) => edge.from === selectedNodeId);

  if (hasChildren) {
    showModal(
      "Confirmação",
      `O item "${nodeToDelete.name}" possui sub-itens. Ao excluí-lo, todos os sub-itens também serão removidos. Deseja continuar?`
    );

    setTimeout(() => {
      if (confirm("Confirma a exclusão?")) {
        performDeletion(selectedNodeId!);
      }
    }, 500);
  } else {
    performDeletion(selectedNodeId);
  }
}

function performDeletion(nodeId: IdType): void {
  const nodeToDelete = nodes.get(nodeId) as TreeNode;

  if (!nodeToDelete) return;

  const nodesToDelete: IdType[] = [];
  const edgesToDelete: IdType[] = [];

  function collectDescendants(parentId: IdType): void {
    nodesToDelete.push(parentId);

    const childEdges = edges.get({
      filter: (edge) => edge.from === parentId,
    });

    childEdges.forEach((edge) => {
      edgesToDelete.push(edge.id!);
      if (edge.to) {
        collectDescendants(edge.to);
      }
    });
  }

  collectDescendants(nodeId);

  const parentEdge = edges.get({
    filter: (edge) => edge.to === nodeId,
  });

  parentEdge.forEach((edge) => {
    edgesToDelete.push(edge.id!);
  });

  edges.remove(edgesToDelete);
  nodes.remove(nodesToDelete);

  selectedNodeId = null;
  const deleteBtn = document.getElementById(
    "delete-item-btn"
  ) as HTMLButtonElement;
  deleteBtn.disabled = true;
  deleteBtn.textContent = "Excluir Item Selecionado";

  showModal(
    "Sucesso",
    `Item "${nodeToDelete.name}" e seus sub-itens foram excluídos com sucesso!`
  );
  console.log(
    `Item excluído: ${nodeToDelete.name} e ${
      nodesToDelete.length - 1
    } sub-itens`
  );
}

function createDefaultExamples(): void {
  createRootNode();

  setTimeout(() => {
    addExampleNode("1", "Blusa", "Opções de Blusa");
    addExampleNode("1", "Calça", "Opções de Calça");
    addExampleNode("1", "Sapato", "Opções de Sapato");

    setTimeout(() => {
      addExampleNode("2", "Blusa", "Rosa");
      addExampleNode("2", "Blusa", "Amarela");
      addExampleNode("2", "Blusa", "Azul");

      addExampleNode("3", "Calça", "Jeans");
      addExampleNode("3", "Calça", "Social");

      addExampleNode("4", "Sapato", "Tênis");
      addExampleNode("4", "Sapato", "Social");
      addExampleNode("4", "Sapato", "Bota");
    }, 100);
  }, 50);
}

function addExampleNode(
  parentId: string,
  category: string,
  name: string
): void {
  const allNodes = nodes.get() as TreeNode[];
  const parentNode = allNodes.find((node) => node.id?.toString() === parentId);

  if (!parentNode) {
    console.log(`Nó pai ${parentId} não encontrado para ${category}: ${name}`);
    return;
  }

  const newLevel = (parentNode.level || 0) + 1;
  maxLevel = Math.max(maxLevel, newLevel);

  const newNode: TreeNode = {
    id: nodeIdCounter++,
    label: `${category}\n${name}`,
    category: category,
    name: name,
    level: newLevel,
    parentId: parentNode.id,
    color: {
      background: getColorByLevel(newLevel),
      border: "#1f2937",
    },
  };

  nodes.add(newNode);

  const newEdge: Edge = {
    from: parentNode.id,
    to: newNode.id,
  };
  edges.add(newEdge);

  console.log(`Exemplo adicionado: ${category} - ${name} (Nível ${newLevel})`);
}

// Event listeners
(document.getElementById("add-item-btn") as HTMLButtonElement).addEventListener(
  "click",
  addItem
);

(
  document.getElementById("delete-item-btn") as HTMLButtonElement
).addEventListener("click", deleteSelectedItem);

(
  document.getElementById("count-combinations-btn") as HTMLButtonElement
).addEventListener("click", countAndListCombinations);

(
  document.getElementById("analyze-complexity-btn") as HTMLButtonElement
).addEventListener("click", analyzeComplexity);

(document.getElementById("reset-btn") as HTMLButtonElement).addEventListener(
  "click",
  resetGraph
);

(document.getElementById("center-btn") as HTMLButtonElement).addEventListener(
  "click",
  centerGraph
);

(
  document.getElementById("load-examples-btn") as HTMLButtonElement
).addEventListener("click", function () {
  resetGraph();
  setTimeout(() => createDefaultExamples(), 100);
});

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    const activeElement = document.activeElement;
    const isInputField =
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.getAttribute("contenteditable") === "true");

    if (!isInputField) {
      event.preventDefault();
      centerGraph();
    }
  }
});

createDefaultExamples();

document.addEventListener("DOMContentLoaded", function () {
  const deleteBtn = document.getElementById(
    "delete-item-btn"
  ) as HTMLButtonElement;
  deleteBtn.disabled = true;
});
