class Node {
  constructor(obj) {
    this.obj = obj
    this.next = null
  }
}

class LinkedList {
  constructor() {
    this.head = null
    this.size = 0
  }

  add(obj) {
    let node = new Node(obj);
    let current;
    if (this.head == null)
      this.head = node
    else {
      current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = node
    }
    this.size++;
  }

  isEmpty() {
    return this.size == 0;
  }
}

module.exports = LinkedList
